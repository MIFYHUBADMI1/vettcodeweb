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
      background: linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 100%);
      padding: 40px 20px;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0a0a0f;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .header { 
      background: linear-gradient(135deg, #8b5cf6 0%, #10b981 100%);
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-20px, -20px) scale(1.1); }
    }
    .logo { 
      font-size: 42px; 
      font-weight: 900; 
      color: white;
      letter-spacing: -1px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .tagline { 
      color: rgba(255, 255, 255, 0.95); 
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    .content { 
      background: linear-gradient(180deg, #1a1a24 0%, #0f0f18 100%);
      padding: 50px 40px;
      position: relative;
    }
    .content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #8b5cf6, #10b981, transparent);
    }
    h2 { 
      color: #ffffff;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 24px;
      letter-spacing: -1px;
      line-height: 1.2;
    }
    .subtitle {
      color: #10b981;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }
    p { 
      color: #b8b8c8;
      margin-bottom: 20px;
      font-size: 16px;
      line-height: 1.8;
    }
    .highlight {
      color: #ffffff;
      font-weight: 600;
    }
    .button-container { 
      text-align: center;
      margin: 40px 0;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
      color: white;
      padding: 18px 50px;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      transition: all 0.3s ease;
      text-transform: uppercase;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(139, 92, 246, 0.6);
    }
    .link-section {
      background: #0a0a0f;
      border: 2px solid #2a2a3a;
      border-radius: 10px;
      padding: 20px;
      margin: 30px 0;
    }
    .link-label {
      color: #8b5cf6;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .link-text {
      color: #10b981;
      font-size: 13px;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      line-height: 1.6;
    }
    .expiry-notice {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(16, 185, 129, 0.15));
      border-left: 4px solid #8b5cf6;
      border-right: 4px solid #10b981;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .expiry-notice p {
      color: #e0e0e8;
      font-size: 15px;
      margin: 0;
      font-weight: 500;
    }
    .security-note {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 25px;
      border-radius: 10px;
      margin-top: 35px;
    }
    .security-note p {
      color: #c8c8d8;
      font-size: 15px;
      margin: 0;
      line-height: 1.7;
    }
    .footer { 
      background: #0a0a0f;
      padding: 40px;
      text-align: center;
      border-top: 1px solid #2a2a3a;
    }
    .footer p { 
      color: #6a6a7a;
      font-size: 14px;
      margin: 10px 0;
    }
    .footer-brand {
      color: #9a9aaa;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .footer-links {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #1a1a24;
    }
    .footer-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 15px;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .footer-links a:hover {
      color: #10b981;
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
      <h2>Verify Your Email Address</h2>
      <div class="subtitle">One step closer to secure development</div>
      
      <p>Welcome to VettCode. You've just joined a community of developers who take security seriously without sacrificing speed.</p>
      
      <p>To activate your account and start building with confidence, verify your email address by clicking the button below:</p>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <div class="link-section">
        <div class="link-label">Alternative verification link</div>
        <div class="link-text">${verificationUrl}</div>
      </div>
      
      <div class="expiry-notice">
        <p><span class="highlight">Valid for 24 hours.</span> After this time, you'll need to request a new verification link.</p>
      </div>
      
      <div class="security-note">
        <p>Didn't create a VettCode account? No action needed. This verification link will expire automatically, and your email address won't be added to our system.</p>
      </div>
    </div>
    <div class="footer">
      <p class="footer-brand">© 2026 VettCode</p>
      <p>Security Intelligence for Modern Developers</p>
      <p style="color: #5a5a6a; font-size: 13px; margin-top: 15px;">This is an automated message. Please do not reply to this email.</p>
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
    subject: 'Verify your VettCode account',
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
      background: linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 100%);
      padding: 40px 20px;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0a0a0f;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%);
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-20px, -20px) scale(1.1); }
    }
    .logo { 
      font-size: 42px; 
      font-weight: 900; 
      color: white;
      letter-spacing: -1px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .tagline { 
      color: rgba(255, 255, 255, 0.95); 
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    .content { 
      background: linear-gradient(180deg, #1a1a24 0%, #0f0f18 100%);
      padding: 50px 40px;
      position: relative;
    }
    .content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #10b981, #8b5cf6, transparent);
    }
    h2 { 
      color: #ffffff;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -1px;
      line-height: 1.2;
    }
    .subtitle {
      color: #10b981;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 30px;
      letter-spacing: 0.5px;
    }
    p { 
      color: #b8b8c8;
      margin-bottom: 20px;
      font-size: 16px;
      line-height: 1.8;
    }
    .highlight {
      color: #ffffff;
      font-weight: 600;
    }
    .intro-text {
      font-size: 18px;
      color: #d8d8e8;
      line-height: 1.8;
      margin: 25px 0 35px;
    }
    .value-props {
      margin: 40px 0;
    }
    .value-prop {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(16, 185, 129, 0.08));
      border-left: 3px solid #8b5cf6;
      padding: 25px;
      margin: 20px 0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    .value-prop:nth-child(even) {
      border-left-color: #10b981;
    }
    .value-prop h3 {
      color: #ffffff;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -0.3px;
    }
    .value-prop p {
      color: #c0c0d0;
      font-size: 15px;
      margin: 0;
      line-height: 1.7;
    }
    .button-container { 
      text-align: center;
      margin: 45px 0;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
      color: white;
      padding: 18px 50px;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      transition: all 0.3s ease;
      text-transform: uppercase;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(139, 92, 246, 0.6);
    }
    .workflow-section {
      background: #0a0a0f;
      border: 2px solid #2a2a3a;
      border-radius: 12px;
      padding: 35px;
      margin: 40px 0;
    }
    .workflow-title {
      color: #10b981;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 25px;
      text-align: center;
      letter-spacing: -0.5px;
    }
    .workflow-step {
      display: flex;
      margin: 20px 0;
      align-items: flex-start;
    }
    .step-number {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      margin-right: 16px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
    .step-content {
      flex: 1;
      padding-top: 4px;
    }
    .step-title {
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 6px;
    }
    .step-description {
      color: #a0a0b0;
      font-size: 14px;
      line-height: 1.6;
    }
    .code-block {
      background: #0a0a0f;
      border: 1px solid #8b5cf6;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #10b981;
      margin-top: 10px;
      font-weight: 500;
    }
    .motivation-box {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(139, 92, 246, 0.12));
      border: 2px solid #10b981;
      padding: 30px;
      border-radius: 12px;
      margin: 40px 0;
      text-align: center;
    }
    .motivation-box p {
      color: #e8e8f0;
      font-size: 17px;
      line-height: 1.9;
      margin: 0;
      font-weight: 500;
    }
    .footer { 
      background: #0a0a0f;
      padding: 40px;
      text-align: center;
      border-top: 1px solid #2a2a3a;
    }
    .footer p { 
      color: #6a6a7a;
      font-size: 14px;
      margin: 10px 0;
    }
    .footer-brand {
      color: #9a9aaa;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .footer-links {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #1a1a24;
    }
    .footer-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 15px;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .footer-links a:hover {
      color: #10b981;
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
      <h2>Welcome, ${displayName}</h2>
      <div class="subtitle">Your secure development journey starts now</div>
      
      <p class="intro-text">You've just joined a movement of developers who refuse to choose between speed and security. With VettCode, you'll ship faster because you're building on solid ground from day one.</p>
      
      <div class="value-props">
        <div class="value-prop">
          <h3>Intelligence That Scales With You</h3>
          <p>From your first commit to production deployments, VettCode adapts to your workflow. Run comprehensive security scans across vulnerabilities, secrets, and code quality without interrupting your flow.</p>
        </div>
        
        <div class="value-prop">
          <h3>Learn While You Build</h3>
          <p>Every security finding becomes a learning opportunity. Our AI explains the why, the how, and the fix in plain language. No security degree required.</p>
        </div>
        
        <div class="value-prop">
          <h3>One Platform, Complete Visibility</h3>
          <p>Connect your IDE, terminal, and browser. Track security trends over time, understand your risk surface, and prove your progress with visual insights that tell the story.</p>
        </div>
      </div>
      
      <div class="button-container">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Open Your Dashboard</a>
      </div>
      
      <div class="workflow-section">
        <div class="workflow-title">Your First Security Scan in 3 Minutes</div>
        
        <div class="workflow-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Install VettCode CLI</div>
            <div class="step-description">One command to add security intelligence to your workflow.</div>
            <div class="code-block">npm install -g vettcode</div>
          </div>
        </div>
        
        <div class="workflow-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">Run Your First Scan</div>
            <div class="step-description">Point VettCode at any project and discover what's hiding in your code.</div>
            <div class="code-block">vettcode scan . --output results.json</div>
          </div>
        </div>
        
        <div class="workflow-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Upload & Analyze</div>
            <div class="step-description">Upload your results to the dashboard and let AI transform raw data into actionable insights.</div>
          </div>
        </div>
      </div>
      
      <div class="motivation-box">
        <p><span class="highlight">Security isn't about perfection.</span> It's about knowing where you stand, understanding your risks, and making informed decisions. VettCode gives you that clarity.</p>
      </div>
      
      <p style="text-align: center; margin-top: 35px;">Questions? Check our <a href="${process.env.NEXTAUTH_URL}/docs" style="color: #8b5cf6; text-decoration: none; font-weight: 600;">documentation</a> or reach out anytime.</p>
    </div>
    <div class="footer">
      <p class="footer-brand">© 2026 VettCode</p>
      <p>Security Intelligence for Modern Developers</p>
      <p style="color: #5a5a6a; font-size: 13px; margin-top: 15px;">Building the future of secure development, one commit at a time.</p>
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
    subject: 'Welcome to VettCode - Your Secure Development Journey Starts Now',
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
      background: linear-gradient(135deg, #0a0a0f 0%, #2e0a0a 100%);
      padding: 40px 20px;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0a0a0f;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .header { 
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    }
    .logo { 
      font-size: 42px; 
      font-weight: 900; 
      color: white;
      letter-spacing: -1px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .tagline { 
      color: rgba(255, 255, 255, 0.95); 
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    .content { 
      background: linear-gradient(180deg, #1a1a24 0%, #0f0f18 100%);
      padding: 50px 40px;
      position: relative;
    }
    .content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #ef4444, transparent);
    }
    h2 { 
      color: #ffffff;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -1px;
      line-height: 1.2;
    }
    .subtitle {
      color: #ef4444;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 25px;
      letter-spacing: 0.5px;
    }
    p { 
      color: #b8b8c8;
      margin-bottom: 20px;
      font-size: 16px;
      line-height: 1.8;
    }
    .highlight {
      color: #ffffff;
      font-weight: 600;
    }
    .button-container { 
      text-align: center;
      margin: 40px 0;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 18px 50px;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
      transition: all 0.3s ease;
      text-transform: uppercase;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(239, 68, 68, 0.6);
    }
    .link-section {
      background: #0a0a0f;
      border: 2px solid #2a2a3a;
      border-radius: 10px;
      padding: 20px;
      margin: 30px 0;
    }
    .link-label {
      color: #ef4444;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .link-text {
      color: #ef4444;
      font-size: 13px;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      line-height: 1.6;
    }
    .expiry-notice {
      background: rgba(239, 68, 68, 0.12);
      border-left: 4px solid #ef4444;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .expiry-notice p {
      color: #e0e0e8;
      font-size: 15px;
      margin: 0;
      font-weight: 500;
    }
    .security-warning {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
      border: 2px solid rgba(239, 68, 68, 0.3);
      padding: 30px;
      border-radius: 12px;
      margin: 35px 0;
    }
    .security-warning-title {
      color: #ffffff;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .security-warning p {
      color: #c8c8d8;
      font-size: 15px;
      line-height: 1.8;
      margin-bottom: 12px;
    }
    .security-warning p:last-child {
      margin-bottom: 0;
    }
    .footer { 
      background: #0a0a0f;
      padding: 40px;
      text-align: center;
      border-top: 1px solid #2a2a3a;
    }
    .footer p { 
      color: #6a6a7a;
      font-size: 14px;
      margin: 10px 0;
    }
    .footer-brand {
      color: #9a9aaa;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .footer-links {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #1a1a24;
    }
    .footer-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 15px;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .footer-links a:hover {
      color: #10b981;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">VettCode</div>
      <div class="tagline">Password Reset</div>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <div class="subtitle">Secure your account with a new password</div>
      
      <p>We received a request to reset the password for your VettCode account. If this was you, click the button below to create a new password and regain access to your security dashboard.</p>
      
      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset Password Now</a>
      </div>
      
      <div class="link-section">
        <div class="link-label">Alternative reset link</div>
        <div class="link-text">${resetUrl}</div>
      </div>
      
      <div class="expiry-notice">
        <p><span class="highlight">This link expires in 1 hour</span> for your security. After that, you'll need to request a new password reset.</p>
      </div>
      
      <div class="security-warning">
        <div class="security-warning-title">Didn't Request This Reset?</div>
        <p>If you didn't ask to reset your password, you can safely ignore this email. Your current password will remain active and your account stays secure.</p>
        <p><span class="highlight">Concerned about unauthorized access?</span> Contact our support team immediately, and we'll help secure your account.</p>
      </div>
    </div>
    <div class="footer">
      <p class="footer-brand">© 2026 VettCode</p>
      <p>Security Intelligence for Modern Developers</p>
      <p style="color: #5a5a6a; font-size: 13px; margin-top: 15px;">This is an automated message. Please do not reply to this email.</p>
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
      background: linear-gradient(135deg, #0a0a0f 0%, #2e1a0a 100%);
      padding: 40px 20px;
    }
    .email-wrapper { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0a0a0f;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .header { 
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-20px, -20px) scale(1.1); }
    }
    .logo { 
      font-size: 42px; 
      font-weight: 900; 
      color: white;
      letter-spacing: -1px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .tagline { 
      color: rgba(255, 255, 255, 0.95); 
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    .content { 
      background: linear-gradient(180deg, #1a1a24 0%, #0f0f18 100%);
      padding: 50px 40px;
      position: relative;
    }
    .content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #f59e0b, transparent);
    }
    h2 { 
      color: #ffffff;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -1px;
      line-height: 1.2;
      text-align: center;
    }
    .subtitle {
      color: #f59e0b;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 30px;
      letter-spacing: 0.5px;
      text-align: center;
    }
    p { 
      color: #b8b8c8;
      margin-bottom: 20px;
      font-size: 16px;
      line-height: 1.8;
    }
    .highlight {
      color: #ffffff;
      font-weight: 600;
    }
    .plan-badge {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 12px 30px;
      border-radius: 25px;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 20px 0 35px;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    }
    .intro-message {
      font-size: 17px;
      color: #d8d8e8;
      text-align: center;
      line-height: 1.9;
      margin-bottom: 40px;
    }
    .benefits-section {
      margin: 40px 0;
    }
    .benefits-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 25px;
      letter-spacing: -0.5px;
    }
    .benefit-item {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(16, 185, 129, 0.08));
      border-left: 3px solid #10b981;
      padding: 20px 25px;
      margin: 16px 0;
      border-radius: 8px;
    }
    .benefit-item:nth-child(even) {
      border-left-color: #8b5cf6;
    }
    .benefit-title {
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 6px;
    }
    .benefit-description {
      color: #a8a8b8;
      font-size: 14px;
      line-height: 1.7;
    }
    .button-container { 
      text-align: center;
      margin: 45px 0;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
      color: white;
      padding: 18px 50px;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      transition: all 0.3s ease;
      text-transform: uppercase;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(139, 92, 246, 0.6);
    }
    .impact-message {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(139, 92, 246, 0.15));
      border: 2px solid rgba(16, 185, 129, 0.3);
      padding: 35px;
      border-radius: 12px;
      margin: 45px 0;
      text-align: center;
    }
    .impact-message p {
      color: #e8e8f0;
      font-size: 18px;
      line-height: 1.9;
      margin: 0;
      font-weight: 500;
    }
    .footer { 
      background: #0a0a0f;
      padding: 40px;
      text-align: center;
      border-top: 1px solid #2a2a3a;
    }
    .footer p { 
      color: #6a6a7a;
      font-size: 14px;
      margin: 10px 0;
    }
    .footer-brand {
      color: #9a9aaa;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .footer-links {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #1a1a24;
    }
    .footer-links a {
      color: #8b5cf6;
      text-decoration: none;
      margin: 0 15px;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .footer-links a:hover {
      color: #10b981;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">VettCode</div>
      <div class="tagline">Upgrade Confirmed</div>
    </div>
    <div class="content">
      <h2>You're Now on ${planName}</h2>
      <div style="text-align: center;">
        <div class="plan-badge">${planName} Plan</div>
      </div>
      
      <p class="intro-message">Thanks for upgrading, ${displayName}. You've just unlocked tools that will help you ship faster and more securely. Here's what's now available to you.</p>
      
      <div class="benefits-section">
        <div class="benefits-title">Your Enhanced Capabilities</div>
        
        <div class="benefit-item">
          <div class="benefit-title">Expanded AI Analysis</div>
          <div class="benefit-description">Higher monthly limits mean you can scan more, learn more, and secure more of your codebase without interruption.</div>
        </div>
        
        <div class="benefit-item">
          <div class="benefit-title">Premium AI Models</div>
          <div class="benefit-description">Access to Claude, GPT-4, and other advanced models that deliver deeper insights and more accurate security recommendations.</div>
        </div>
        
        <div class="benefit-item">
          <div class="benefit-title">Priority Processing</div>
          <div class="benefit-description">Your scans get routed to the fastest available AI, reducing wait times when you need answers immediately.</div>
        </div>
        
        <div class="benefit-item">
          <div class="benefit-title">Extended History</div>
          <div class="benefit-description">Keep your scan results longer to track security improvements over weeks and months, not just days.</div>
        </div>
        
        <div class="benefit-item">
          <div class="benefit-title">Advanced Analytics</div>
          <div class="benefit-description">Detailed reports that show trends, patterns, and progress across your entire project lifecycle.</div>
        </div>
        
        <div class="benefit-item">
          <div class="benefit-title">Priority Support</div>
          <div class="benefit-description">Get help faster when you need it, with dedicated support channels for ${planName} members.</div>
        </div>
      </div>
      
      <div class="button-container">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Explore Your Dashboard</a>
      </div>
      
      <div class="impact-message">
        <p><span class="highlight">Your upgrade directly supports our mission</span> to make security accessible for every developer. Thank you for being part of the VettCode community and helping us build better tools for everyone.</p>
      </div>
    </div>
    <div class="footer">
      <p class="footer-brand">© 2026 VettCode</p>
      <p>Security Intelligence for Modern Developers</p>
      <p style="color: #5a5a6a; font-size: 13px; margin-top: 15px;">Questions about your ${planName} plan? We're here to help.</p>
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
    subject: `Welcome to VettCode ${planName} - Your Upgrade is Active`,
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
