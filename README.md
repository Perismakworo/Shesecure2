# SheSecure - Safety and Chat Application

SheSecure is a safety and chat application designed to help users stay connected and safe. This application allows users to register, join circles, share locations, send SOS alerts, and chat with circle members.

## Features

- **User Registration and Login:** Users can register, verify their email, and log in.
- **Profile Management:** Users can update their profile information and upload profile photos.
- **Circle Management:** Users can create circles, join circles using invite codes, and view circle members.
- **Location Sharing:** Users can share their real-time location with circle members.
- **SOS Alerts:** Users can send SOS alerts to circle members, notifying them via push notifications and emails.
- **Chat Functionality:** Users can send messages and images to circle members in a chat interface.

## Installation

To run this application locally, follow these steps:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-repository-url.git
    cd your-repository-directory
    ```

2. **Install server dependencies:**
    ```bash
    cd server
    npm install
    ```

3. **Configure environment variables:**
    Create a `.env` file in the `server` directory with the following content:
    ```env
    DB_HOST=your_db_host
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    EMAIL_USER=your_email_user
    EMAIL_PASS=your_email_password
    JWT_SECRET=your_jwt_secret
    ```

4. **Run the server:**
    ```bash
    npm start
    ```

5. **Install client dependencies:**
    ```bash
    cd ../client
    npm install
    ```

6. **Run the client:**
    ```bash
    npm start
    ```

## Usage

- **Registration:**
    - Open the app and navigate to the registration screen.
    - Enter your name, email, and password to register.
    - Verify your email by clicking the link sent to your email address.

- **Login:**
    - Enter your email and password to log in.

- **Profile Management:**
    - Navigate to the profile screen to update your profile information and upload a profile photo.

- **Circle Management:**
    - Create a circle and generate an invite code.
    - Join a circle using an invite code.
    - View members in your circle.

- **Location Sharing:**
    - Share your real-time location with circle members.

- **SOS Alerts:**
    - Send an SOS alert to notify circle members.

- **Chat:**
    - Send and receive messages and images in the chat interface.

## API Endpoints

The following are some of the key API endpoints used by the application:

- **User Registration:** `POST /register`
- **Email Verification:** `GET /verify-email`
- **User Login:** `POST /login`
- **Forgot Password:** `POST /forgot-password`
- **Reset Password:** `POST /reset-password`
- **Profile Photo Upload:** `POST /uploadProfilePhoto`
- **Get User Profile:** `GET /getUserProfile`
- **Update Profile:** `PUT /profile`
- **Generate Invite Code:** `POST /generateInviteCode`
- **Join Circle:** `POST /joinCircle`
- **Get User Circles:** `GET /getUserCircles`
- **Get Circle Members:** `GET /getCircleMembers`
- **Leave Circle:** `POST /leaveCircle`
- **Update Location:** `POST /updateLocation`
- **Get Circle Locations:** `GET /getCircleLocations`
- **Send SOS:** `POST /sendSOS`
- **Save Push Token:** `POST /savePushToken`
- **Save Message:** `POST /saveMessage`
- **Get Messages:** `GET /getMessages`

## Database Schema

### Users Table
- `id`: INT, Primary Key, Auto Increment
- `name`: VARCHAR(255)
- `email`: VARCHAR(255), Unique
- `password`: VARCHAR(255)
- `profilePhotoUrl`: VARCHAR(255), NULL
- `verified`: BOOLEAN, Default: false

### Circles Table
- `id`: INT, Primary Key, Auto Increment
- `name`: VARCHAR(255)
- `leader_email`: VARCHAR(255)

### Circle Members Table
- `circle_id`: INT
- `member_email`: VARCHAR(255)

### Messages Table
- `id`: INT, Primary Key, Auto Increment
- `circle_id`: INT
- `sender_email`: VARCHAR(255)
- `message`: TEXT
- `image_url`: VARCHAR(255), NULL
- `created_at`: TIMESTAMP, Default: CURRENT_TIMESTAMP

### User Locations Table
- `email`: VARCHAR(255)
- `latitude`: DOUBLE
- `longitude`: DOUBLE
- `timestamp`: TIMESTAMP, Default: CURRENT_TIMESTAMP

### Invite Codes Table
- `code`: VARCHAR(6), Primary Key
- `circle_id`: INT
- `expires_at`: TIMESTAMP

### Push Tokens Table
- `email`: VARCHAR(255)
- `token`: VARCHAR(255)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

