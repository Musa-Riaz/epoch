import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Email configuration
// You can use Gmail, SendGrid, AWS SES, or any SMTP service


const transporter = nodemailer.createTransport({
  // For development, you can use Ethereal (fake SMTP service)
  // For production, use real email service
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// Test the connection (optional)
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
}

interface SendInvitationEmailParams {
  to: string;
  projectName: string;
  inviterName: string;
  invitationToken: string;
  frontendUrl: string;
}

/**
 * Send project invitation email to a user
 */
export async function sendInvitationEmail({
  to,
  projectName,
  inviterName,
  invitationToken,
  frontendUrl,
}: SendInvitationEmailParams): Promise<boolean> {
  try {
    const invitationLink = `${frontendUrl}/accept-invitation?token=${invitationToken}`;
    
    const mailOptions = {
      from: `"Epoch Project Management" <${process.env.SMTP_FROM || 'noreply@epoch.com'}>`,
      to,
      subject: `You've been invited to join "${projectName}" on Epoch`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #5568d3; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Project Invitation</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              
              <p><strong>${inviterName}</strong> has invited you to join the project <strong>"${projectName}"</strong> on Epoch Project Management.</p>
              
              <div class="info-box">
                <p><strong>What is Epoch?</strong></p>
                <p>Epoch is a collaborative project management platform where teams can organize tasks, track progress, and achieve their goals together.</p>
              </div>
              
              <p>Click the button below to accept the invitation and join the project:</p>
              
              <div style="text-align: center;">
                <a href="${invitationLink}" class="button">Accept Invitation</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <code style="background: #e0e0e0; padding: 5px; border-radius: 3px; word-break: break-all;">${invitationLink}</code>
              </p>
              
              <div class="info-box">
                <p><strong>⏰ This invitation expires in 7 days</strong></p>
                <p style="margin: 5px 0;">If you don't have an account yet, you'll be able to create one after accepting the invitation.</p>
              </div>
              
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Epoch Project Management. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        You've been invited to join "${projectName}" on Epoch!
        
        ${inviterName} has invited you to collaborate on this project.
        
        Accept your invitation by clicking this link:
        ${invitationLink}
        
        This invitation expires in 7 days.
        
        If you didn't expect this invitation, you can safely ignore this email.
        
        © ${new Date().getFullYear()} Epoch Project Management
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invitation email sent:', info.messageId);
    
    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.log('this is the password',process.env.SMTP_PASS)
    console.error('❌ Failed to send invitation email:', error);
    return false;
  }
}

interface SendWelcomeEmailParams {
  to: string;
  name: string;
  projectName: string;
}

/**
 * Send welcome email when user joins a project
 */
export async function sendWelcomeEmail({
  to,
  name,
  projectName,
}: SendWelcomeEmailParams): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Epoch Project Management" <${process.env.SMTP_FROM || 'noreply@epoch.com'}>`,
      to,
      subject: `Welcome to "${projectName}"!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 Welcome Aboard!</h1>
            </div>
            <div class="content">
              <p>Hi ${name}!</p>
              
              <p>You've successfully joined the project <strong>"${projectName}"</strong>!</p>
              
              <p>You can now:</p>
              <ul>
                <li>View and manage tasks</li>
                <li>Collaborate with team members</li>
                <li>Track project progress</li>
                <li>Receive updates and notifications</li>
              </ul>
              
              <p>Let's build something amazing together! 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false;
  }
}

export default transporter;
