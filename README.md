# Suraksha Backend API

Backend API for the Suraksha Safety App - A comprehensive emergency response and safety monitoring application.

## Features

- **User Authentication** - JWT-based registration and login
- **Contact Management** - Trusted contact system
- **Emergency Alerts** - Real-time emergency notifications
- **Location Services** - Location tracking and sharing
- **Voice Services** - Text-to-speech using Eleven Labs
- **Email/SMS Notifications** - Emergency alerts via Resend and Twilio

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Resend** - Email service
- **Twilio** - SMS service
- **Eleven Labs** - Voice generation

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB Atlas account or local MongoDB
- Resend API key (for emails)
- Twilio account (optional, for SMS)
- Eleven Labs API key (optional, for voice)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd suraksha-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Contacts
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Emergency
- `POST /api/emergency/alert` - Send emergency alert
- `GET /api/emergency/alerts` - Get alert history

### Location
- `POST /api/location/update` - Update user location
- `POST /api/location/share` - Share location with contacts

### Voice (Optional)
- `POST /api/voice/generate` - Generate voice from text
- `GET /api/voice/voices` - Get available voices

### Health Check
- `GET /api/health` - API health status

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_sender_email
TWILIO_ACCOUNT_SID=your_twilio_sid (optional)
TWILIO_AUTH_TOKEN=your_twilio_token (optional)
TWILIO_PHONE_NUMBER=your_twilio_number (optional)
ELEVEN_LABS_API_KEY=your_elevenlabs_key (optional)
NODE_ENV=development
PORT=3000
```

## Project Structure

```
src/
├── config/
│   └── database.js         # MongoDB connection
├── controllers/            # Route handlers
│   ├── authController.js
│   ├── contactController.js
│   ├── emergencyController.js
│   ├── locationController.js
│   ├── userController.js
│   └── voiceController.js
├── middleware/             # Custom middleware
│   ├── auth.js
│   └── logging.js
├── models/                 # Database models
│   ├── Contact.js
│   ├── EmergencyAlert.js
│   ├── Location.js
│   ├── User.js
│   └── index.js
├── routes/                 # Route definitions
│   ├── authRoutes.js
│   ├── contactRoutes.js
│   ├── emergencyRoutes.js
│   ├── locationRoutes.js
│   ├── userRoutes.js
│   └── voiceRoutes.js
├── services/               # External services
│   ├── emailService.js
│   ├── smsService.js
│   └── voiceService.js
└── server.js              # Main application file
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform.

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Input validation
- CORS protection
- Rate limiting (recommended for production)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.