/**
 * Email Service (Gmail SMTP)
 * Used for verification emails, notifications, etc.
 */

import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ VettCode</h1>
      <p>Security Coach for Developers</p>
    </div>
    <div class="content">
      <h2>Verify Your Email</h2>
      <p>Thanks for signing up for VettCode! Please verify your email address to get started.</p>
      <p>Click the button below to verify your account:</p>
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 14px; color: #666;">
        If you didn't create an account with VettCode, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 VettCode - Security Coach for Developers</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"VettCode" <noreply@vettcode.dev>',
    to: email,
    subject: 'Verify your VettCode account',
    html,
  })
}

/**
 * Send welcome email (after verification)
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  const displayName = name || 'there'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to VettCode!</h1>
    </div>
    <div class="content">
      <h2>Hi ${displayName}! 👋</h2>
      <p>Your account is now verified and ready to use. Here's what you can do with VettCode:</p>
      
      <div class="feature">
        <h3>🔍 Upload Scan Results</h3>
        <p>Run VettCode CLI and upload your scan results for detailed analysis.</p>
      </div>
      
      <div class="feature">
        <h3>🤖 AI-Powered Explanations</h3>
        <p>Get beginner-friendly security explanations powered by AI.</p>
      </div>
      
      <div class="feature">
        <h3>📊 Track Your Progress</h3>
        <p>View scan history and track security improvements over time.</p>
      </div>
      
      <div class="feature">
        <h3>🎓 Learn Security</h3>
        <p>Each finding includes educational content to help you learn.</p>
      </div>
      
      <a href="${process.env.NEXTAUTH_URL}" class="button">Go to Dashboard</a>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
      
      <h3>Getting Started</h3>
      <ol>
        <li>Install VettCode CLI: <code>npm install -g vettcode</code></li>
        <li>Scan your project: <code>vettcode scan . --output results.json</code></li>
        <li>Upload results to the dashboard</li>
        <li>Get AI-powered security insights!</li>
      </ol>
      
      <p>Need help? Check out our <a href="${process.env.NEXTAUTH_URL}/docs">documentation</a> or reach out to support.</p>
    </div>
    <div class="footer">
      <p>© 2024 VettCode - Security Coach for Developers</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"VettCode" <noreply@vettcode.dev>',
    to: email,
    subject: 'Welcome to VettCode! 🎉',
    html,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>You requested to reset your VettCode password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      
      <div class="warning">
        <strong>⚠️ Security Notice:</strong><br>
        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
      </div>
    </div>
    <div class="footer">
      <p>© 2024 VettCode - Security Coach for Developers</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"VettCode" <noreply@vettcode.dev>',
    to: email,
    subject: 'Reset your VettCode password',
    html,
  })
}

/**
 * Send plan upgrade notification
 */
export async function sendPlanUpgradeEmail(
  email: string,
  name: string | undefined,
  plan: string
): Promise<void> {
  const displayName = name || 'there'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Plan Upgraded!</h1>
    </div>
    <div class="content">
      <h2>Hi ${displayName}!</h2>
      <p>Your VettCode plan has been upgraded to <strong>${plan}</strong>! 🎉</p>
      <p>You now have access to:</p>
      <ul>
        <li>More AI explanations per month</li>
        <li>Advanced AI models</li>
        <li>Priority AI routing</li>
        <li>Extended scan history</li>
        <li>Advanced reports</li>
      </ul>
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
      <p>Thanks for supporting VettCode!</p>
    </div>
    <div class="footer">
      <p>© 2024 VettCode - Security Coach for Developers</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"VettCode" <noreply@vettcode.dev>',
    to: email,
    subject: `Welcome to VettCode ${plan}!`,
    html,
  })
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('✅ Email server is ready')
    return true
  } catch (error) {
    console.error('❌ Email server configuration error:', error)
    return false
  }
}
