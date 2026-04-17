# FUNTECH Creative Challenge

Nigeria's Biggest Virtual Creative Contest - A comprehensive platform for discovering, developing, and showcasing creative talent across Nigeria.

## Overview

The FUNTECH Creative Challenge is a fully digital, nationwide competition designed to discover, develop, and showcase creative talent across Nigeria. It operates as a virtual experience, allowing creatives and audiences to participate from anywhere.

## Features

### Core Functionality
- **User Registration & Authentication**: Complete user management with email verification
- **Payment Integration**: Paystack integration for registration fees and voting
- **Creative ID System**: Auto-generated unique IDs for all contestants
- **Password Reset**: Secure password recovery via email
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Contest Management
- **Multi-category Support**: 13 creative categories from Design to Advertising
- **Weekly Challenges**: Structured competition with weekly tasks
- **Submission System**: File upload with Cloudinary integration
- **Voting System**: Secure voting with anti-cheat measures
- **Leaderboard**: Real-time ranking and progress tracking

### Admin Features
- **User Management**: Approve contestants and manage profiles
- **Contest Control**: Manage contest stages and weekly tasks
- **Payment Tracking**: Monitor all financial transactions
- **Content Moderation**: Review and approve submissions

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **React Query**: Server state management
- **React Hook Form**: Form handling with Zod validation

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type-safe development
- **MongoDB**: NoSQL database with Mongoose
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing

### Integrations
- **Paystack**: Payment processing
- **Cloudinary**: File storage and CDN
- **Nodemailer**: Email sending
- **Express Validator**: Input validation

## Project Structure

```
funtech-creative/
frontend/
  src/
    app/                  # Next.js App Router pages
      login/
      register/
      reset-password/
      success/
    features/             # Feature-based components
      auth/
      dashboard/
      contest/
      voting/
      profile/
      payments/
    services/             # API services
    store/                # Zustand state management
    components/           # Reusable UI components
    
backend/
  src/
    modules/              # Feature modules
      auth/
      payments/
      users/
      contest/
      submissions/
      votes/
      notifications/
    database/             # Database models and connection
    middlewares/          # Express middleware
    utils/                # Utility functions
    config/               # Configuration files
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Paystack account for payments
- Cloudinary account for file storage
- Email service (Gmail or other SMTP)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd funtech-creative
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Environment Setup**

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=https://cre-8-frontend.vercel.app

# Database
MONGODB_URI=mongodb://localhost:27017/funtech-creative

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="FUNTECH Creative" <noreply@funtechcreative.com>
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Start the development servers**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/history` - Payment history
- `POST /api/payments/vote` - Voting payment
- `POST /api/payments/webhook/paystack` - Paystack webhook

## Database Schema

### Users
- Personal information (name, email, phone)
- Creative ID and category
- Profile details and social links
- Authentication and password reset tokens

### Contests
- Contest details and status
- Weekly tasks and challenges
- Prize structure and settings

### Submissions
- User submissions for weekly challenges
- File attachments and metadata
- Approval status and feedback

### Votes
- Voting records with payment verification
- Anti-cheat measures and tracking

### Payments
- All financial transactions
- Registration fees, voting payments
- Gateway integration and status

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Comprehensive validation with express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet.js**: Security headers and protections

## Payment Flow

1. **Registration**: User pays 2,000 NGN registration fee
2. **Creative ID**: Generated after successful payment
3. **Voting**: Users can purchase vote bundles (1, 5, 10, 25 votes)
4. **Verification**: Webhook verification for all payments

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Render/Railway)
```bash
cd backend
npm run build
# Deploy to your preferred platform
```

### Database (MongoDB Atlas)
- Set up MongoDB Atlas cluster
- Update connection string in environment variables
- Configure network access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@funtechcreative.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## Future Enhancements

- **Live Streaming**: Real-time contest events
- **Mobile App**: React Native mobile application
- **Analytics Dashboard**: Advanced analytics and insights
- **Social Features**: Community and networking features
- **AI Integration**: Automated content analysis and scoring
