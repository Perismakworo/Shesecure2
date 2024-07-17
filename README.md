

---

# SheSecure Project

## Description
The SheSecure Project is a mobile application designed to enhance personal safety by enabling users to create and join secure circles where members can share their live locations with each other. The app allows users to create circles, generate invite codes, join circles, and view the real-time locations of all members within their circles.

## Project Setup/Installation Instructions

### Dependencies
- Node.js
- Express
- MySQL
- bcryptjs
- jsonwebtoken
- nodemailer
- cors
- multer
- path
- fs
- dotenv
- React Native
- Expo
- axios
- react-navigation
- expo-location
- react-native-maps

### Installation Steps
1. **Clone the repository**
    ```bash
    git clone https://github.com/your-username/Shesecure2
    cd Shesecure
    ```

2. **Backend Setup**
    1. Navigate to the backend directory:
        ```bash
        cd backend
        ```
    2. Install backend dependencies:
        ```bash
        npm install
        ```
    3. Set up the environment variables by creating a `.env` file:
        ```env
        DB_HOST=your_database_host
        DB_USER=your_database_user
        DB_PASSWORD=your_database_password
        DB_NAME=your_database_name
        EMAIL_USER=your_email_user
        EMAIL_PASS=your_email_password
        JWT_SECRET=your_jwt_secret

        ```
    4. Run the backend server:
        ```bash
        node index.js
        ```

3. **Frontend Setup**
    1. Navigate to the frontend directory:
        ```bash
        cd ../fronted
        ```
    2. Install frontend dependencies:
        ```bash
        npm install
        ```
    3. Start the Expo server:
        ```bash
        npx expo start
        ```

## Usage Instructions

### How to Run
1. **Backend Server**
    Ensure the backend server is running:
    ```bash
    cd backend
    node index.js
    ```

2. **Frontend App**
    Ensure the Expo server is running:
    ```bash
    cd frontend
    npx expo start
    ```

3. Use the Expo Go app on your mobile device to scan the QR code and load the app.

### Examples
- **Creating a Circle**: Navigate to the "Create Circle" screen, enter a circle name, and generate an invite code.
- **Joining a Circle**: Navigate to the "Join Circle" screen, enter an invite code, and join the circle.
- **Viewing Locations**: On the home screen, view the live locations of circle members on the map.

### Input/Output
- **Input**: User information (name, email, password), circle name, invite code, and location data (latitude, longitude).
- **Output**: Real-time location data displayed on a map, invite codes, and user profiles.

## Project Structure

### Overview
The project is organized into two main folders: `backend` and `frontend`.

### Backend
- **index.js**: Main server file that sets up the Express server and defines API endpoints.
- **config/**: Contains configuration files for the database and other settings.
- **models/**: Contains database schema definitions.
- **routes/**: Contains route definitions for user authentication, circle management, and location updates.

### Frontend
- **App.js**: Main entry point of the React Native app.
- **screens/**: Contains various screen components such as HomeScreen, CreateCircleScreen, JoinCircleScreen, and CircleManagementScreen.
- **components/**: Contains reusable components such as MapView and ProfileIcon.
- **navigation/**: Contains navigation setup using React Navigation.

### Folder Structure

```plaintext
shesecure/
│
├── .expo/
│   ├── web/
│   ├── devices.json
│   ├── packager-info.json
│   ├── README.md
│   └── settings.json
│
├── assets/
│   ├── img/
│   │   ├── adaptive-icon.png
│   │   ├── background1.jpg
│   │   ├── background2.jpg
│   │   ├── favicon.png
│   │   ├── icon.png
│   │   ├── logo.jpg
│   │   └── splash.png
│
├── backend/
│   ├── .expo/
│   ├── assets/
│   ├── node_modules/
│   ├── .env
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
│
├── screens/
│   ├── AddProfilePhotoScreen.js
│   ├── ChangePasswordScreen.js
│   ├── ChatScreen.js
│   ├── CircleManagementScreen.js
│   ├── CreateCircleScreen.js
│   ├── EditEmailScreen.js
│   ├── EditNameScreen.js
│   ├── EmergencyContactsScreen.js
│   ├── FirstScreen.js
│   ├── HomeScreen.js
│   ├── InviteCodeScreen.js
│   ├── JoinCircleScreen.js
│   ├── LocationHistoryScreen.js
│   ├── LoginScreen.js
│   ├── ProfileScreen.js
│   ├── RegistrationScreen.js
│   ├── ResetPasswordScreen.js
│   ├── SafetyScreen.js
│   ├── SecondScreen.js
│   ├── SOSCountdownScreen.js
│   └── SOSInitialScreen.js
│
├── .gitignore
├── App.js
├── app.json
├── babel.config.js
├── package-lock.json
├── package.json
└── README.md
```

## Key Files
- App.js: Main entry point of the React Native app.
- index.js: Main server file that sets up the Express server and defines API endpoint

### Project Status
The project is currently in progress.

### Known Issues
- Location updates might be delayed on slow networks.
- Invite codes expire after 2 days and need to be regenerated.

### Acknowledgements
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)

### License
This project is licensed under the MIT License. 

![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Contact Information
For questions or feedback, please open an issue on GitHub or contact:
- Email: peris.makworo@strathmore.edu

---

