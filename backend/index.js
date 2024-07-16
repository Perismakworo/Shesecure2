const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Expo } = require('expo-server-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const expo = new Expo();

app.use(express.json());
app.use(cors());

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
  console.log('MySQL connected...');
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Ensure the 'assets' directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Serve static files from the 'assets' directory
app.use('/assets', express.static(assetsDir));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Register User
app.post('/register', (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 12);

  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, hashedPassword], (err, result) => {
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
      res.status(201).json({ message: 'User registered, please verify your email.', userId: result.insertId });
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

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, name: user.name, profilePhotoUrl: user.profilePhotoUrl });
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

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET); // Token without expiry
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

// Serve Reset Password Form
app.get('/reset-password', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('Invalid request, token missing');
  }
  res.send(`
    <html>
      <body>
        <form action="/reset-password" method="POST">
          <input type="hidden" name="token" value="${token}" />
          <label for="password">New Password:</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Reset Password</button>
        </form>
      </body>
    </html>
  `);
});

// Reset Password Endpoint
app.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  console.log('Reset password requested with token:', token);

  if (!token) {
    console.error('Token is missing');
    return res.status(400).json({ error: 'Invalid request, token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Invalid token:', err.message);
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

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

// Profile Photo Upload
app.post('/uploadProfilePhoto', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const file = req.file;
    const userEmail = req.user.email; // Get userEmail from the authenticated user
    if (!file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    // Save the file to the server
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(assetsDir, fileName);
    await fs.promises.writeFile(filePath, file.buffer);

    // Save the relative file URL to the user's profile in the database
    const fileUrl = `/assets/${fileName}`;
    const sql = 'UPDATE users SET profilePhotoUrl = ? WHERE email = ?';
    db.query(sql, [fileUrl, userEmail], (err, result) => {
      if (err) {
        console.error('Error saving profile photo URL:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      // Retrieve the name of the user
      const userSql = 'SELECT name FROM users WHERE email = ?';
      db.query(userSql, [userEmail], (userErr, userResult) => {
        if (userErr || userResult.length === 0) {
          console.error('Error retrieving user name:', userErr.message);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        const userName = userResult[0].name;
        res.status(200).json({ fileUrl, name: userName });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to upload file' });
  }
});

// Get user profile
app.get('/getUserProfile', authenticateToken, (req, res) => {
  const userEmail = req.user.email;

  const sql = 'SELECT name, email, profilePhotoUrl FROM users WHERE email = ?';
  db.query(sql, [userEmail], (err, result) => {
    if (err) {
      console.error('Error fetching user profile:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Update user profile
app.put('/profile', authenticateToken, (req, res) => {
  const { name, profilePhoto } = req.body;
  const userEmail = req.user.email;

  console.log('Incoming profile update request:', req.body);

  if (!name) {
    console.log('Invalid data:', { name });
    return res.status(400).json({ error: 'Invalid data' });
  }

  const sql = 'UPDATE users SET name = ?, profilePhotoUrl = ? WHERE email = ?';
  db.query(sql, [name, profilePhoto, userEmail], (err, result) => {
    if (err) {
      console.error('Error updating profile:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

// Update user email
app.put('/updateEmail', authenticateToken, (req, res) => {
  const { email } = req.body;
  const userEmail = req.user.email;

  console.log('Incoming email update request:', req.body);

  if (!email) {
    console.log('Invalid data:', { email });
    return res.status(400).json({ error: 'Invalid data' });
  }

  const sql = 'UPDATE users SET email = ? WHERE email = ?';
  db.query(sql, [email, userEmail], (err, result) => {
    if (err) {
      console.error('Error updating email:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Email updated successfully' });
  });
});

// Change user password
app.put('/changePassword', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userEmail = req.user.email;

  console.log('Incoming password change request:', req.body);

  if (!currentPassword || !newPassword) {
    console.log('Invalid data:', { currentPassword, newPassword });
    return res.status(400).json({ error: 'Invalid data' });
  }

  const sql = 'SELECT password FROM users WHERE email = ?';
  db.query(sql, [userEmail], (err, result) => {
    if (err) {
      console.error('Error retrieving current password:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0];
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 12);
    const updateSql = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(updateSql, [hashedPassword, userEmail], (updateErr, _updateResult) => {
      if (updateErr) {
        console.error('Error updating password:', updateErr.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Password updated successfully' });
    });
  });
});

// Generate Invite Code and Create Circle
app.post('/generateInviteCode', authenticateToken, (req, res) => {
  const { circleName } = req.body;
  const userEmail = req.user.email;

  const inviteCode = generateCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 2); // Code valid for 2 days

  // Start transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'Transaction error' });

    // Create circle
    const createCircleSql = 'INSERT INTO circles (name, leader_email) VALUES (?, ?)';
    db.query(createCircleSql, [circleName, userEmail], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: 'Error creating circle' });
        });
      }

      const circleId = result.insertId;

      // Insert invite code
      const inviteCodeSql = 'INSERT INTO invite_codes (code, circle_id, expires_at) VALUES (?, ?, ?)';
      db.query(inviteCodeSql, [inviteCode, circleId, expiresAt], (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: 'Error generating invite code' });
          });
        }

        // Commit transaction
        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: 'Transaction commit error' });
            });
          }

          res.status(200).json({ code: inviteCode });
        });
      });
    });
  });
});

// Join Circle using Invite Code
app.post('/joinCircle', authenticateToken, (req, res) => {
  const { inviteCode } = req.body;
  const userEmail = req.user.email;

  const sql = 'SELECT * FROM invite_codes WHERE code = ? AND expires_at > NOW()';
  db.query(sql, [inviteCode], (err, result) => {
    if (err) {
      console.error('Error finding invite code:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invite code' });
    }

    const circleId = result[0].circle_id;
    const joinSql = 'INSERT INTO circle_members (circle_id, member_email) VALUES (?, ?)';
    db.query(joinSql, [circleId, userEmail], (joinErr, joinResult) => {
      if (joinErr) {
        console.error('Error joining circle:', joinErr.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Successfully joined the circle' });
    });
  });
});

// Get User Circles
app.get('/getUserCircles', authenticateToken, (req, res) => {
  const userEmail = req.user.email;

  const sql = `
    SELECT c.id, c.name 
    FROM circles c 
    LEFT JOIN circle_members cm ON c.id = cm.circle_id 
    WHERE c.leader_email = ? OR cm.member_email = ?
  `;
  db.query(sql, [userEmail, userEmail], (err, result) => {
    if (err) {
      console.error('Error fetching user circles:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(result);
  });
});

// Get Circle Members
app.get('/getCircleMembers', authenticateToken, (req, res) => {
  const { circleId } = req.query;

  const sql = `
    SELECT u.email, u.name, pt.token AS pushToken 
    FROM users u 
    LEFT JOIN circle_members cm ON u.email = cm.member_email 
    LEFT JOIN push_tokens pt ON u.email = pt.email
    WHERE cm.circle_id = ? OR u.email = (SELECT leader_email FROM circles WHERE id = ?)
  `;
  db.query(sql, [circleId, circleId], (err, result) => {
    if (err) {
      console.error('Error fetching circle members:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(result);
  });
});

// Leave Circle
app.post('/leaveCircle', authenticateToken, (req, res) => {
  const { circleId } = req.body;
  const userEmail = req.user.email;

  const sql = 'DELETE FROM circle_members WHERE circle_id = ? AND member_email = ?';
  db.query(sql, [circleId, userEmail], (err, result) => {
    if (err) {
      console.error('Error leaving circle:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Successfully left the circle' });
  });
});

// Update user location
app.post('/updateLocation', authenticateToken, (req, res) => {
  const { latitude, longitude } = req.body;
  const userEmail = req.user.email;

  const sql = 'REPLACE INTO user_locations (email, latitude, longitude, timestamp) VALUES (?, ?, ?, NOW())';
  db.query(sql, [userEmail, latitude, longitude], (err, result) => {
    if (err) {
      console.error('Error updating location:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Location updated successfully' });
  });
});

// Get locations of circle members
app.get('/getCircleLocations', authenticateToken, (req, res) => {
  const userEmail = req.user.email;

  const sql = `
    SELECT ul.email, ul.latitude, ul.longitude, c.name AS circle_name, u.profilePhotoUrl
    FROM user_locations ul 
    JOIN circle_members cm ON ul.email = cm.member_email 
    JOIN circles c ON cm.circle_id = c.id
    JOIN users u ON ul.email = u.email
    WHERE cm.circle_id IN (SELECT circle_id FROM circle_members WHERE member_email = ?)
    OR ul.email IN (SELECT leader_email FROM circles WHERE id IN (SELECT circle_id FROM circle_members WHERE member_email = ?))
  `;
  db.query(sql, [userEmail, userEmail], (err, result) => {
    if (err) {
      console.error('Error fetching circle locations:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(result);
  });
});

// Get location history of circle members
app.get('/getLocationHistory', authenticateToken, (req, res) => {
  const { memberEmail } = req.query;
  const userEmail = req.user.email;

  const sql = `
    SELECT ul.email, ul.latitude, ul.longitude, ul.timestamp
    FROM user_locations ul
    JOIN circle_members cm ON ul.email = cm.member_email
    JOIN circles c ON cm.circle_id = c.id
    WHERE cm.circle_id IN (SELECT circle_id FROM circle_members WHERE member_email = ?)
    AND ul.email = ?
    ORDER BY ul.timestamp DESC
  `;
  db.query(sql, [userEmail, memberEmail], (err, result) => {
    if (err) {
      console.error('Error fetching location history:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(result);
  });
});

// Send SOS Notification
app.post('/sendSOS', authenticateToken, (req, res) => {
  const { latitude, longitude } = req.body;
  const userEmail = req.user.email;

  const getUserSql = 'SELECT name FROM users WHERE email = ?';
  db.query(getUserSql, [userEmail], (err, userResult) => {
    if (err) {
      console.error('Error fetching user name:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userName = userResult[0].name;

    const getCircleMembersSql = `
      SELECT u.email, u.name, pt.token AS pushToken 
      FROM users u 
      LEFT JOIN circle_members cm ON u.email = cm.member_email 
      LEFT JOIN push_tokens pt ON u.email = pt.email
      WHERE cm.circle_id IN (SELECT circle_id FROM circle_members WHERE member_email = ?)
      OR u.email IN (SELECT leader_email FROM circles WHERE id IN (SELECT circle_id FROM circle_members WHERE member_email = ?))
    `;
    db.query(getCircleMembersSql, [userEmail, userEmail], (err, membersResult) => {
      if (err) {
        console.error('Error fetching circle members:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const messages = [];
      const emails = [];
      membersResult.forEach(member => {
        if (member.pushToken && Expo.isExpoPushToken(member.pushToken)) {
          messages.push({
            to: member.pushToken,
            sound: 'default',
            body: `${userName} has triggered an SOS. View their current location in the SheSecure application.`,
            data: { withSome: 'data' },
          });
        }
        emails.push(member.email);
      });

      // Send push notifications
      const chunks = expo.chunkPushNotifications(messages);
      (async () => {
        for (let chunk of chunks) {
          try {
            await expo.sendPushNotificationsAsync(chunk);
          } catch (error) {
            console.error(error);
          }
        }
      })();

      // Send email notifications
      emails.forEach(email => {
        transporter.sendMail({
          to: email,
          subject: `${userName} needs help`,
          text: `${userName} has triggered an SOS. View their current location in the SheSecure application.`,
        }, (emailErr, _info) => {
          if (emailErr) {
            console.error('Error sending SOS email:', emailErr.message);
          }
        });
      });

      res.status(200).json({ message: 'SOS sent successfully' });
    });
  });
});

// Save Push Token
app.post('/savePushToken', authenticateToken, (req, res) => {
  const { token } = req.body;
  const userEmail = req.user.email;

  const sql = 'REPLACE INTO push_tokens (email, token) VALUES (?, ?)';
  db.query(sql, [userEmail, token], (err, result) => {
    if (err) {
      console.error('Error saving push token:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Push token saved successfully' });
  });
});

// Chat Endpoints
// Save chat message
app.post('/saveMessage', authenticateToken, upload.single('image'), (req, res) => {
  const { circleId, message, receiver_email } = req.body;
  const sender_email = req.user.email;

  console.log('Request Body:', req.body); // Add this line for logging

  if (!receiver_email) {
    return res.status(400).json({ error: 'receiver_email is required' });
  }

  let imageUrl = null;
  if (req.file) {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(assetsDir, fileName);
    fs.promises.writeFile(filePath, req.file.buffer)
      .then(() => {
        imageUrl = `/assets/${fileName}`;
      })
      .catch((err) => {
        console.error('Error saving image:', err.message);
        return res.status(500).json({ error: 'Error saving image' });
      });
  }

  const sql = 'INSERT INTO messages (circle_id, sender_email, receiver_email, message, image_url, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
  db.query(sql, [circleId, sender_email, receiver_email, message, imageUrl], (err, result) => {
    if (err) {
      console.error('Error saving message:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Message saved successfully' });
  });
});

// Get chat messages
app.get('/getMessages', authenticateToken, (req, res) => {
  const { circleId } = req.query;

  const sql = `
    SELECT m.id, m.message, m.image_url, m.created_at, u.name AS sender_name, u.profilePhotoUrl, r.name AS receiver_name
    FROM messages m 
    JOIN users u ON m.sender_email = u.email 
    JOIN users r ON m.receiver_email = r.email
    WHERE m.circle_id = ? 
    ORDER BY m.created_at ASC
  `;
  db.query(sql, [circleId], (err, result) => {
    if (err) {
      console.error('Error fetching messages:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(result);
  });
});

// Function to generate invite code
function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
