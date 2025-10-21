Backend Documentation 🚗✨
\ Documentation for the Backend of Web-Carshowroom-Full-stack
🚀 Overview
The Backend of Web-Carshowroom-Full-stack is built with Node.js and Express to handle API requests, manage user authentication, and interact with a MySQL database. It supports features like car data management, user authentication, and email notifications.
Project Structure

src/: Main source code directory.
config/: Configuration files (e.g., database, environment variables).
controllers/: Request handlers for API endpoints.
middleware/: Custom middleware (e.g., authentication, file uploads).
models/: Database models for MySQL.
routes/: API route definitions.
utils/: Utility functions (e.g., email sending, validation).
server.ts: Main server file to start the Express app.



Dependencies

bcryptjs: 3.0.2 - For password hashing.
cors: 2.8.5 - For enabling Cross-Origin Resource Sharing.
date-fns: 4.1.0 - For date manipulation.
dotenv: 16.4.7 - For environment variable management.
express: 4.21.2 - Web framework for Node.js.
jsonwebtoken: 9.0.2 - For JWT-based authentication.
multer: 1.4.5-lts.2 - For handling file uploads.
mysql2: 3.14.0 - MySQL client for database interaction.
nodemailer: 6.10.1 - For sending emails.
nodemon: 3.1.9 - For auto-restarting the server during development.
ts-node: 10.9.2 - For running TypeScript directly.
validator: 13.15.0 - For input validation.
ws: 8.18.1 - For WebSocket support.

Dev Dependencies

@types/bcryptjs: 3.0.0 - TypeScript types for bcryptjs.
@types/cors: 2.8.17 - TypeScript types for cors.
@types/date-fns: 2.6.3 - TypeScript types for date-fns.
@types/express: 5.0.1 - TypeScript types for Express.
@types/jsonwebtoken: 9.0.9 - TypeScript types for jsonwebtoken.
@types/multer: 1.4.12 - TypeScript types for multer.
@types/node: 22.13.14 - TypeScript types for Node.js.
@types/nodemailer: 6.4.17 - TypeScript types for nodemailer.
@types/validator: 13.12.3 - TypeScript types for validator.
@types/ws: 8.18.1 - TypeScript types for ws.
typescript: 5.8.2 - TypeScript for type safety.

Setup and Usage

Navigate to the Backend directory:
cd web-carshowroom-Backend


Install dependencies:
npm install


Set up environment variables in a .env file:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=car_showroom
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password


Start the server:
npm start


The server will run on http://localhost:5000.


API Endpoints

GET /api/cars: Fetch all cars from the database.
GET /api/cars/:id: Fetch a specific car by ID.
POST /api/cars: Add a new car (requires authentication and file upload for images).
POST /api/auth/register: Register a new user.
POST /api/auth/login: Login and receive a JWT token.
POST /api/contact: Send a contact email via nodemailer.

Features

User Authentication: Uses jsonwebtoken and bcryptjs for secure login and registration.
Database Management: Uses mysql2 to interact with a MySQL database for storing car data.
File Uploads: Handles image uploads with multer.
Email Notifications: Sends emails using nodemailer.
WebSocket Support: Real-time updates with ws.

Testing

Unit Testing: Use Mocha or Jest to test API endpoints.
Manual Testing: Test API endpoints using tools like Postman.

