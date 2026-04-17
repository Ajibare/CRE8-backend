import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Email Config:', {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  user: process.env.EMAIL_USER,
  from: process.env.EMAIL_FROM,
  hasPass: !!process.env.EMAIL_PASS,
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // Use SSL on port 465 (more reliable than STARTTLS on 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    console.log('Sending email to:', to);
    console.log('From:', process.env.EMAIL_FROM);
    console.log('Email subject:', subject);

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured. EMAIL_USER or EMAIL_PASS is missing.');
      // In development, just log the email content instead of failing
      if (process.env.NODE_ENV !== 'production') {
        console.log('========== EMAIL CONTENT (Development Mode) ==========');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('HTML:', html.substring(0, 500) + '...');
        console.log('=======================================================');
        return; // Don't throw in development
      }
      throw new Error('Email credentials not configured');
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"FUNTECH Creative" <noreply@funtechcreative.com>',
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error: any) {
    console.error('Email sending failed:', error);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    console.error('Error command:', error.command);
    
    // In development, don't fail - just log the error
    if (process.env.NODE_ENV !== 'production') {
      console.log('========== EMAIL CONTENT (Development Mode - Failed to send) ==========');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('HTML:', html.substring(0, 500) + '...');
      console.log('=======================================================================');
      console.log('Note: Email failed but continuing in development mode');
      return;
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const emailTemplates = {
  paymentConfirmation: (email: string, reference: string, amount: number) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF6B35;">Payment Successful!</h2>
      <p>Hi there,</p>
      <p>Thank you for your payment. Your registration fee has been received successfully.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Details:</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Amount:</strong> ₦${amount}</p>
        <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">Successful</span></p>
      </div>
      <p>Please complete your registration using the same email address: <strong>${email}</strong></p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/register?payment=success&email=${encodeURIComponent(email)}&ref=${encodeURIComponent(reference)}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Complete Registration
        </a>
      </div>
      <p>Good luck!</p>
      <p>The FUNTECH Team</p>
    </div>
  `,

  welcome: (name: string, creativeId: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF6B35;">Welcome to FUNTECH Creative Challenge!</h2>
      <p>Hi ${name},</p>
      <p>Congratulations! You're now part of Nigeria's Biggest Virtual Creative Contest.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Your Creative ID: <strong style="color: #FF6B35;">${creativeId}</strong></h3>
      </div>
      <p>What's next?</p>
      <ol>
        <li>Wait for your audition schedule</li>
        <li>Prepare your best creative work</li>
        <li>Get ready to compete and win amazing prizes</li>
      </ol>
      <p>Good luck!</p>
      <p>The FUNTECH Team</p>
    </div>
  `,
  
  auditionSchedule: (name: string, date: string, time: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF6B35;">Your Audition is Scheduled!</h2>
      <p>Hi ${name},</p>
      <p>Your virtual audition has been scheduled. Here are the details:</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Audition Details:</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Platform:</strong> Virtual (Link will be sent 24 hours before)</p>
      </div>
      <p>Please prepare a 3-minute presentation of your best work.</p>
      <p>Best of luck!</p>
      <p>The FUNTECH Team</p>
    </div>
  `,
  
  contestStart: (name: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF6B35;">The Contest Begins!</h2>
      <p>Hi ${name},</p>
      <p>The FUNTECH Creative Challenge has officially started!</p>
      <p>Log in to your dashboard to see your first weekly challenge and submit your work.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>What you need to do:</h3>
        <ol>
          <li>Check your dashboard for this week's challenge</li>
          <li>Submit your work before the deadline</li>
          <li>Share your work to get votes</li>
        </ol>
      </div>
      <p>Let the creativity begin!</p>
      <p>The FUNTECH Team</p>
    </div>
  `,
  
  votingPush: (name: string, contestantName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF6B35;">Support Your Favorite Creative!</h2>
      <p>Hi ${name},</p>
      <p>Voting is now open! Support ${contestantName} in the FUNTECH Creative Challenge.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>How to Vote:</h3>
        <ol>
          <li>Visit the voting page</li>
          <li>Select ${contestantName}</li>
          <li>Choose your voting bundle</li>
          <li>Complete payment</li>
        </ol>
      </div>
      <p>Every vote counts!</p>
      <p>The FUNTECH Team</p>
    </div>
  `,

  paymentVerification: (email: string, verificationLink: string, reference: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF6B35;">Payment Successful! Verify Your Email</h2>
      <p>Hi there,</p>
      <p>Thank you for your payment! Your registration fee has been received successfully.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Details:</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">Successful</span></p>
      </div>
      <p>Please click the button below to verify your email and complete your registration:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Verify Email & Register
        </a>
      </div>
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link: ${verificationLink}</p>
      <p>This verification link will expire in 24 hours.</p>
      <p>The FUNTECH Team</p>
    </div>
  `,
};
