const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS configuration to allow multiple origins
const allowedOrigins = ['http://172.20.10.3:8081', 'http://localhost:8081'];
app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('MySQL connection error:', err.message);
        process.exit(1);
    }
    console.log('MySQL connected...');
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Custom error handling middleware
app.use((err, req, res, next) => {
    console.error('Internal Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
}

// Register User
app.post('/register', (req, res, next) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 12);

    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, _result) => {
        if (err) {
            console.error('Error registering user:', err.message);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'User already exists' });
            }
            return next(err);
        }

        const emailToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const url = `http://172.20.10.3:5000/verify-email?token=${emailToken}`;

        transporter.sendMail({
            to: email,
            subject: 'Verify Your Email',
            html: `Click <a href="${url}">here</a> to verify your email.`,
        }, (emailErr, _info) => {
            if (emailErr) {
                console.error('Error sending verification email:', emailErr.message);
                return res.status(500).json({ error: 'Error sending verification email' });
            }
            console.log('Verification email sent:', email);
            res.status(201).json({ message: 'User registered, please verify your email.' });
        });
    });
});

// Email Verification
app.get('/verify-email', (req, res) => {
    const { token } = req.query;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(400).json({ error: 'Invalid or expired token' });

        const sql = 'UPDATE users SET verified = 1 WHERE email = ?';
        db.query(sql, [decoded.email], (err, _result) => {
            if (err) {
                console.error('Error verifying email:', err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(200).json({ message: 'Email verified successfully' });
        });
    });
});

// Login User
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Error finding user:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result[0];
        if (!user.verified) {
            return res.status(401).json({ error: 'Please verify your email before logging in' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    });
});

// Forgot Password
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    console.log('Forgot password requested for email:', email);

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Error finding user:', err.message, err.stack);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.length === 0) {
            console.warn('User not found for email:', email);
            return res.status(404).json({ error: 'User not found' });
        }

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const url = `http://172.20.10.3:5000/reset-password?token=${resetToken}`;
        console.log('Password reset URL generated:', url);

        transporter.sendMail({
            to: email,
            subject: 'Reset Password',
            html: `Click <a href="${url}">here</a> to reset your password.`,
        }, (emailErr, _info) => {
            if (emailErr) {
                console.error('Error sending password reset email:', emailErr.message, emailErr.stack);
                return res.status(500).json({ error: 'Error sending password reset email' });
            }
            console.log('Password reset email sent to:', email);
            res.status(200).json({ message: 'Password reset email sent' });
        });
    });
});

// Reset Password
app.post('/reset-password', (req, res) => {
    const { token, password } = req.body;
    console.log('Reset password requested with token:', token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(400).json({ error: 'Invalid or expired token' });

        const hashedPassword = bcrypt.hashSync(password, 12);
        const sql = 'UPDATE users SET password = ? WHERE email = ?';
        db.query(sql, [hashedPassword, decoded.email], (err, _result) => {
            if (err) {
                console.error('Error resetting password:', err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log('Password reset successfully for email:', decoded.email);
            res.status(200).json({ message: 'Password has been reset' });
        });
    });
});


// Protected route example
app.get('/protected-route', authenticateToken, (_req, res) => {
    res.json({ message: 'Access granted' });
});

// Uncaught exception handler
process.on('uncaughtException', function (err) {
    console.error('Uncaught Exception:', err.message);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
