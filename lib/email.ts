/**
 * Email Service (Gmail SMTP)
 * Used for verification emails, notifications, etc.
 */

import nodemailer from 'nodemailer'

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; 
      line-height: 1.6; 
      background: #0a0a0f;
      padding: 20px;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0a0a0f;
    }
    .header { 
      background: linear-gradient(135deg, #8b5cf6 0%, #10b981 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
    }
    .logo { 
      font-size: 32px; 
      font-weight: 800; 
      color: white;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .tagline { 
      color: rgba(255, 255, 255, 0.9); 
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .content { 
      background: #1a1a24;
      padding: 40px 30px;
      border-left: 1px solid #2a2a3a;
      border-right: 1px solid #2a2a3a;
    }
    h2 { 
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    p { 
      color: #a0a0b0;
      margin-bottom: 16px;
      font-size: 15px;
      line-height: 1.7;
    }
    .button-container { 
      text-align: center;
      margin: 32px 0;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }
    .button:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    }
    .link-box {
      background: #0a0a0f;
      border: 1px solid #2a2a3a;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .link-text {
      color: #8b5cf6;
      font-size: 13px;
      word-break: break-all;
      font-family: 'Courier New', monospace;
    }
    .divider {
      height: 1px;
      background: #2a2a3a;
      margin: 32px 0;
    }
    .notice {
      background: rgba(139, 92, 246, 0.1);
      border-left: 3px solid #8b5cf6;
      padding: 16px;
      border-radius: 6px;
      margin-top: 24px;
    }
    .notice p {
      color: #c0c0d0;
      font-size: 14px;
      margin: 0;
    }
    .footer { 
      background: #0a0a0f;
      padding: 30px;
      text-align: center;
      border-radius: 0 0 12px 12px;
      border: 1px solid #2a2a3a;
      border-top: none;
    }
    .footer p { 
      color: #666677;
      font-size: 13px;
      margin: 8px 0;
    }
    .footer-links {
      margin-top: 16px;
    }
    .footer-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 12px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">VettCode</div>
      <div class="tagline">Build. Secure. Ship.</div>
    </div>
    <div class="content">
      <h2>🔐 Verify Your Email</h2>
      <p>Welcome to VettCode! You're one step away from accessing your security dashboard.</p>
      <p>Click the button below to verify your email address and activate your account:</p>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p style="text-align: center; color: #666677; font-size: 13px;">Or copy and paste this link:</p>
      <div class="link-box">
        <div class="link-text">${verificationUrl}</div>
      </div>
      
      <p style="color: #888899; font-size: 14px;">⏱️ This verification link expires in 24 hours.</p>
      
      <div class="divider"></div>
      
      <div class="notice">
        <p>🛡️ If you didn't create a VettCode account, you can safely ignore this email. Your security is our priority.</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 VettCode - Security Intelligence for Modern Developers</p>
      <p style="color: #555566;">This is an automated message, please do not reply to this email.</p>
      <div class="footer-links">
        <a href="${process.env.NEXTAUTH_URL}">Dashboard</a>
        <a href="${process.env.NEXTAUTH_URL}/docs">Documentation</a>
        <a href="https://github.com/MIFYHUBADMI1/vettcodeweb">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"VettCode" <noreply@vettcode.dev>',
    to: email,
    subject: '🔐 Verify your VettCode account',
    html,
  })
}

/**
 * Send welcome email (after verification)
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  const displayName = name || 'Developer'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; 
      line-height: 1.6; 
      background: #0a0a0f;
      padding: 20px;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0a0a0f;
    }
    .header { 
      background: linear-gradient(135deg, #8b5cf6 0%, #10b981 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
    }
    .logo { 
      font-size: 32px; 
      font-weight: 800; 
      color: white;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .tagline { 
      color: rgba(255, 255, 255, 0.9); 
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .content { 
      background: #1a1a24;
      padding: 40px 30px;
      border-left: 1px solid #2a2a3a;
      border-right: 1px solid #2a2a3a;
    }
    h2 { 
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    p { 
      color: #a0a0b0;
      margin-bottom: 16px;
      font-size: 15px;
      line-height: 1.7;
    }
    .greeting {
      font-size: 20px;
      color: #ffffff;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .feature-grid {
      display: grid;
      gap: 16px;
      margin: 32px 0;
    }
    .feature { 
      background: #0a0a0f;
      border: 1px solid #2a2a3a;
      border-left: 3px solid #8b5cf6;
      padding: 20px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    .feature h3 { 
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .feature p { 
      color: #888899;
      font-size: 14px;
      margin: 0;
    }
    .button-container { 
      text-align: center;
      margin: 32px 0;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }
    .divider {
      height: 1px;
      background: #2a2a3a;
      margin: 32px 0;
    }
    .getting-started {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 24px;
      margin-top: 32px;
    }
    .getting-started h3 {
      color: #10b981;
      font-size: 18px;
      margin-bottom: 16px;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin: 16px 0;
    }
    .step-number {
      background: #8b5cf6;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .step-content {
      color: #a0a0b0;
      font-size: 14px;
      padding-top: 4px;
    }
    .code {
      background: #0a0a0f;
      border: 1px solid #2a2a3a;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #10b981;
      margin-top: 8px;
      display: inline-block;
    }
    .footer { 
      background: #0a0a0f;
      padding: 30px;
      text-align: center;
      border-radius: 0 0 12px 12px;
      border: 1px solid #2a2a3a;
      border-top: none;
    }
    .footer p { 
      color: #666677;
      font-size: 13px;
      margin: 8px 0;
    }
    .footer-links {
      margin-top: 16px;
    }
    .footer-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 12px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">VettCode</div>
      <div class="tagline">Build. Secure. Ship.</div>
    </div>
    <div class="content">
      <h2>🎉 Welcome to VettCode!</h2>
      <div class="greeting">Hi ${displayName}! 👋</div>
      <p>Your account is verified and ready to go. You now have access to the complete VettCode ecosystem for secure development.</p>
      
      <div class="feature-grid">
        <div class="feature">
          <h3>🔍 Security Scanning</h3>
          <p>Run comprehensive security scans with VettCode CLI - covering vulnerabilities, secrets, and code quality.</p>
        </div>
        
        <div class="feature">
          <h3>🤖 AI-Powered Analysis</h3>
          <p>Get intelligent explanations for every finding. Learn as you build with context-aware insights.</p>
        </div>
        
        <div class="feature">
          <h3>📊 Visual Dashboard</h3>
          <p>Track security metrics, view scan history, and monitor improvements over time in one place.</p>
        </div>
        
        <div class="feature">
          <h3>🚀 Seamless Integration</h3>
          <p>Connect VettCode Vibe, CLI, and Web for a complete security workflow from IDE to production.</p>
        </div>
      </div>
      
      <div class="button-container">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Open Dashboard</a>
      </div>
      
      <div class="divider"></div>
      
      <div class="getting-started">
        <h3>🚀 Quick Start Guide</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            Install VettCode CLI globally:
            <div class="code">npm install -g vettcode</div>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            Scan your project for vulnerabilities:
            <div class="code">vettcode scan . --output results.json</div>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            Upload results to your dashboard and get AI-powered insights instantly.
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            Fix vulnerabilities with confidence using actionable recommendations.
          </div>
        </div>
      </div>
      
      <p style="margin-top: 32px; text-align: center;">Need help? Check out our <a href="${process.env.NEXTAUTH_URL}/docs" style="color: #8b5cf6; text-decoration: none;">documentation</a> or reach out to support.</p>
    </div>
    <div class="footer">
      <p>© 2026 VettCode - Security Intelligence for Modern Developers</p>
      <p style="color: #555566;">Build secure software with confidence.</p>
      <div class="footer-links">
        <a href="${process.env.NEXTAUTH_URL}">Dashboard</a>
        <a href="${process.env.NEXTAUTH_URL}/docs">Docs</a>
        <a href="https://github.com/MIFYHUBADMI1/vettcodeweb">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"VettCode" <noreply@vettcode.dev>',
    to: email,
    subject: '🎉 Welcome to VettCode - Let\'s Build Secure Software!',
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; 
      line-height: 1.6; 
      background: #0a0a0f;
      padding: 20px;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0a0a0f;
    }
    .header { 
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
    }
    .logo { 
      font-size: 32px; 
      font-weight: 800; 
      color: white;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .tagline { 
      color: rgba(255, 255, 255, 0.9); 
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .content { 
      background: #1a1a24;
      padding: 40px 30px;
      border-left: 1px solid #2a2a3a;
      border-right: 1px solid #2a2a3a;
    }
    h2 { 
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    p { 
      color: #a0a0b0;
      margin-bottom: 16px;
      font-size: 15px;
      line-height: 1.7;
    }
    .button-container { 
      text-align: center;
      margin: 32px 0;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }
    .link-box {
      background: #0a0a0f;
      border: 1px solid #2a2a3a;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .link-text {
      color: #ef4444;
      font-size: 13px;
      word-break: break-all;
      font-family: 'Courier New', monospace;
    }
    .warning { 
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-left: 3px solid #ef4444;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .warning-title {
      color: #ef4444;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
    }
    .warning p { 
      color: #c0c0d0;
      font-size: 14px;
      margin: 0;
    }
    .divider {
      height: 1px;
      background: #2a2a3a;
      margin: 32px 0;
    }
    .footer { 
      background: #0a0a0f;
      padding: 30px;
      text-align: center;
      border-radius: 0 0 12px 12px;
      border: 1px solid #2a2a3a;
      border-top: none;
    }
    .footer p { 
      color: #666677;
      font-size: 13px;
      margin: 8px 0;
    }
    .footer-links {
      margin-top: 16px;
    }
    .footer-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 12px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">VettCode</div>
      <div class="tagline">Password Reset Request</div>
    </div>
    <div class="content">
      <h2>🔒 Reset Your Password</h2>
      <p>We received a request to reset the password for your VettCode account. Click the button below to create a new password:</p>
      
      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p style="text-align: center; color: #666677; font-size: 13px;">Or copy and paste this link:</p>
      <div class="link-box">
        <div class="link-text">${resetUrl}</div>
      </div>
      
      <p style="color: #888899; font-size: 14px;">⏱️ This reset link expires in 1 hour for security.</p>
      
      <div class="divider"></div>
      
      <div class="warning">
        <div class="warning-title">⚠️ Security Notice</div>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged and your account is secure.</p>
        <p style="margin-top: 12px;">If you're concerned about your account security, please contact our support team immediately.</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 VettCode - Security Intelligence for Modern Developers</p>
      <p style="color: #555566;">This is an automated message, please do not reply to this email.</p>
      <div class="footer-links">
        <a href="${process.env.NEXTAUTH_URL}">Dashboard</a>
        <a href="${process.env.NEXTAUTH_URL}/support">Support</a>
        <a href="https://github.com/MIFYHUBADMI1/vettcodeweb">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"VettCode" <noreply@vettcode.dev>',
    to: email,
    subject: '🔒 Reset your VettCode password',
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
  const displayName = name || 'Developer'
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; 
      line-height: 1.6; 
      background: #0a0a0f;
      padding: 20px;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0a0a0f;
    }
    .header { 
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
    }
    .logo { 
      font-size: 32px; 
      font-weight: 800; 
      color: white;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .tagline { 
      color: rgba(255, 255, 255, 0.9); 
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .content { 
      background: #1a1a24;
      padding: 40px 30px;
      border-left: 1px solid #2a2a3a;
      border-right: 1px solid #2a2a3a;
    }
    h2 { 
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    p { 
      color: #a0a0b0;
      margin-bottom: 16px;
      font-size: 15px;
      line-height: 1.7;
    }
    .plan-badge {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.5px;
      margin: 16px 0;
    }
    .benefits-grid {
      display: grid;
      gap: 12px;
      margin: 32px 0;
    }
    .benefit { 
      background: #0a0a0f;
      border: 1px solid #2a2a3a;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: start;
    }
    .benefit-icon {
      color: #10b981;
      font-size: 20px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .benefit-text { 
      color: #a0a0b0;
      font-size: 14px;
    }
    .button-container { 
      text-align: center;
      margin: 32px 0;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }
    .thank-you {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 8px;
      padding: 20px;
      margin-top: 32px;
      text-align: center;
    }
    .thank-you p {
      color: #c0c0d0;
      font-size: 15px;
      margin: 0;
    }
    .footer { 
      background: #0a0a0f;
      padding: 30px;
      text-align: center;
      border-radius: 0 0 12px 12px;
      border: 1px solid #2a2a3a;
      border-top: none;
    }
    .footer p { 
      color: #666677;
      font-size: 13px;
      margin: 8px 0;
    }
    .footer-links {
      margin-top: 16px;
    }
    .footer-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 12px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">VettCode</div>
      <div class="tagline">Plan Upgrade Confirmation</div>
    </div>
    <div class="content">
      <h2>🚀 Plan Upgraded Successfully!</h2>
      <p>Hi ${displayName}!</p>
      <p>Great news! Your VettCode plan has been upgraded to:</p>
      <div style="text-align: center;">
        <div class="plan-badge">${planName} Plan</div>
      </div>
      
      <p style="margin-top: 24px;">You now have access to enhanced features that will supercharge your security workflow:</p>
      
      <div class="benefits-grid">
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text"><strong>More AI Explanations:</strong> Higher monthly limits for security insights</div>
        </div>
        
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text"><strong>Advanced AI Models:</strong> Access to premium Claude, GPT-4, and more</div>
        </div>
        
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text"><strong>Priority Processing:</strong> Faster AI routing and response times</div>
        </div>
        
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text"><strong>Extended History:</strong> Keep scan results and insights for longer</div>
        </div>
        
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text"><strong>Advanced Reports:</strong> Detailed analytics and trend analysis</div>
        </div>
        
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <div class="benefit-text"><strong>Premium Support:</strong> Priority support for your security needs</div>
        </div>
      </div>
      
      <div class="button-container">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Explore Your Dashboard</a>
      </div>
      
      <div class="thank-you">
        <p>💜 Thank you for supporting VettCode! Your upgrade helps us build better security tools for developers everywhere.</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 VettCode - Security Intelligence for Modern Developers</p>
      <p style="color: #555566;">Questions? Contact support anytime.</p>
      <div class="footer-links">
        <a href="${process.env.NEXTAUTH_URL}/dashboard">Dashboard</a>
        <a href="${process.env.NEXTAUTH_URL}/billing">Billing</a>
        <a href="${process.env.NEXTAUTH_URL}/support">Support</a>
      </div>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"VettCode" <noreply@vettcode.dev>',
    to: email,
    subject: `🚀 Welcome to VettCode ${planName}!`,
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
