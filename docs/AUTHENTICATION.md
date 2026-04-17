# Authentication System Documentation

## Overview

The FUNTECH Creative Challenge backend implements a comprehensive authentication system with secure password management, email verification, and rate limiting.

## Features

### Core Authentication
- **User Registration**: Multi-step registration with payment verification
- **Login/Logout**: JWT-based authentication with secure token management
- **Password Reset**: Secure email-based password recovery
- **Profile Management**: User profile updates and management

### Security Features
- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive input sanitization
- **Security Headers**: XSS, CSRF, and clickjacking protection

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Registers a new user and initiates payment process.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348000000000",
  "category": "Design"
}
```

**Response (201):**
```json
{
  "message": "Registration initiated. Please complete payment to activate your account.",
  "userId": "user_id",
  "paymentReference": "payment_reference",
  "amount": 2000
}
```

#### POST `/api/auth/login`
Authenticates a user and returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "creativeId": "FUN-2026-0001",
    "category": "Design",
    "role": "creative",
    "isApproved": false
  }
}
```

#### POST `/api/auth/logout`
Logs out a user (client-side token removal).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Logout successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### POST `/api/auth/forgot-password`
Initiates password reset process.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### POST `/api/auth/reset-password`
Resets user password with valid token.

**Request Body:**
```json
{
  "token": "reset_token",
  "email": "john@example.com",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### POST `/api/auth/refresh-token`
Refreshes JWT token for authenticated users.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "token": "new_jwt_token",
  "user": { ... }
}
```

#### GET `/api/auth/profile`
Gets user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "creativeId": "FUN-2026-0001",
    "category": "Design",
    "role": "creative",
    "isApproved": false,
    "bio": "User bio",
    "socialLinks": {
      "instagram": "instagram_url",
      "twitter": "twitter_url"
    }
  }
}
```

#### PUT `/api/auth/profile`
Updates user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "bio": "Updated bio",
  "socialLinks": {
    "instagram": "new_instagram_url",
    "twitter": "new_twitter_url"
  }
}
```

## Security Implementation

### Password Security
- **Hashing**: Bcrypt with 12 salt rounds
- **Validation**: Minimum 6 characters, no common passwords
- **Reset Tokens**: 32-byte random tokens with 10-minute expiry
- **Token Hashing**: SHA-256 hashing for reset tokens

### Rate Limiting
- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Password Reset**: 3 attempts per 15 minutes per IP

### Security Headers
- **X-Frame-Options**: DENY (prevent clickjacking)
- **X-Content-Type-Options**: nosniff (prevent MIME sniffing)
- **X-XSS-Protection**: 1; mode=block (enable XSS protection)
- **Strict-Transport-Security**: HSTS in production
- **Content-Security-Policy**: Default-src 'self'

### Input Validation
- **Email Format**: RFC 5322 compliant email validation
- **Password Strength**: Length and common password checks
- **Input Sanitization**: XSS prevention
- **SQL Injection Prevention**: Mongoose ODM protection

## Database Schema

### User Model
```typescript
interface IUser {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'creative' | 'voter';
  creativeId?: string;
  category?: string;
  profileImage?: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    portfolio?: string;
  };
  isVerified: boolean;
  isApproved: boolean;
  auditionStatus?: 'pending' | 'approved' | 'rejected';
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastPasswordReset?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Standard Error Responses
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

## Email Templates

### Password Reset Email
- Professional HTML template with security notices
- 10-minute expiration warning
- Branding and user personalization
- Security tips and support information

### Password Reset Confirmation
- Success confirmation with account details
- Security recommendations
- Immediate login link
- Security warning for unauthorized changes

## Testing

### Unit Tests
- Authentication controller functions
- Password utility functions
- Validation middleware
- Security middleware

### Integration Tests
- Complete authentication flow
- Password reset flow
- Rate limiting functionality
- Error handling scenarios

### Security Tests
- SQL injection attempts
- XSS attack prevention
- CSRF protection
- Brute force attack prevention

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="FUNTECH Creative" <noreply@funtechcreative.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Best Practices

### Password Management
1. Use strong, unique passwords
2. Implement secure password reset flow
3. Log password changes for security
4. Prevent password reuse
5. Implement account lockout after failed attempts

### Token Management
1. Use short-lived JWT tokens
2. Implement token refresh mechanism
3. Store tokens securely on client
4. Invalidate tokens on logout
5. Use HTTPS for token transmission

### Security Monitoring
1. Log all authentication attempts
2. Monitor for suspicious activity
3. Implement IP-based restrictions
4. Use security headers
5. Regular security audits

## Troubleshooting

### Common Issues

1. **Token Not Working**
   - Check JWT secret configuration
   - Verify token expiration
   - Ensure proper Authorization header format

2. **Password Reset Not Working**
   - Check email configuration
   - Verify reset token generation
   - Check token expiration logic

3. **Rate Limiting Issues**
   - Check Redis/Memory store for rate limiter
   - Verify IP detection
   - Check rate limit configuration

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=auth:*
```

## Future Enhancements

1. **Two-Factor Authentication**: SMS or TOTP-based 2FA
2. **Social Login**: Google, Facebook, Twitter integration
3. **Session Management**: Active session tracking
4. **Password Policies**: Complex password requirements
5. **Account Recovery**: Multi-factor account recovery
