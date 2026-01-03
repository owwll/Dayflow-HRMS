import transporter from '../config/email';
import logger from './logger';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        logger.info(`Email sent to ${options.to}`);
    } catch (error) {
        logger.error('Error sending email:', error);
        throw error;
    }
};

export const sendWelcomeEmail = async (
    email: string,
    firstName: string,
    loginId: string,
    tempPassword: string
): Promise<void> => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Dayflow HRMS</h1>
        </div>
        <div class="content">
          <p>Dear ${firstName},</p>
          <p>Welcome to ${process.env.COMPANY_NAME || 'our company'}! Your employee account has been created successfully.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Login ID:</strong> ${loginId}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          
          <p><strong>Important:</strong> For security reasons, you will be required to change your password upon first login.</p>
          
          <p>If you have any questions, please contact your HR department.</p>
          
          <p>Best regards,<br>Dayflow HRMS Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: 'Welcome to Dayflow HRMS - Your Account Details',
        html,
    });
};

export const sendOTPEmail = async (email: string, otp: string, firstName: string): Promise<void> => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .otp-box { background-color: #fff; padding: 20px; text-align: center; margin: 20px 0; border: 2px dashed #2196F3; }
        .otp { font-size: 32px; font-weight: bold; color: #2196F3; letter-spacing: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Login Verification</h1>
        </div>
        <div class="content">
          <p>Dear ${firstName},</p>
          <p>Your One-Time Password (OTP) for logging into Dayflow HRMS is:</p>
          
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          
          <p><strong>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</strong></p>
          <p>If you did not request this OTP, please ignore this email or contact your administrator.</p>
          
          <p>Best regards,<br>Dayflow HRMS Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: 'Your OTP for Dayflow HRMS Login',
        html,
    });
};

export const sendLeaveStatusEmail = async (
    email: string,
    firstName: string,
    status: 'approved' | 'rejected',
    leaveType: string,
    startDate: string,
    endDate: string,
    comments?: string
): Promise<void> => {
    const statusColor = status === 'approved' ? '#4CAF50' : '#f44336';
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .leave-details { background-color: #fff; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Leave Request ${statusText}</h1>
        </div>
        <div class="content">
          <p>Dear ${firstName},</p>
          <p>Your leave request has been <strong>${statusText.toLowerCase()}</strong>.</p>
          
          <div class="leave-details">
            <h3>Leave Details:</h3>
            <p><strong>Type:</strong> ${leaveType}</p>
            <p><strong>From:</strong> ${startDate}</p>
            <p><strong>To:</strong> ${endDate}</p>
            ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
          </div>
          
          <p>If you have any questions, please contact your manager or HR department.</p>
          
          <p>Best regards,<br>Dayflow HRMS Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await sendEmail({
        to: email,
        subject: `Leave Request ${statusText} - Dayflow HRMS`,
        html,
    });
};
