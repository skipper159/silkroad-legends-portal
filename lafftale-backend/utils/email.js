const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const config = require('../email/config');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
  debug: true,
  logger: true,
  // Increase timeouts to avoid "Greeting never received" on slow servers
  connectionTimeout: parseInt(process.env.EMAIL_CONNECTION_TIMEOUT || '30000', 10),
  greetingTimeout: parseInt(process.env.EMAIL_GREETING_TIMEOUT || '30000', 10),
  socketTimeout: parseInt(process.env.EMAIL_SOCKET_TIMEOUT || '60000', 10),
  name: process.env.EMAIL_NAME || require('os').hostname(),
  tls: {
    // Allow opting out of strict certificate validation if the mailserver uses a self-signed cert
    rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
  },
});

// Create token for password reset or email verification
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email for account verification
const sendVerificationEmail = async (email, token) => {
  // Create verification URL
  const verifyUrl = `${config.frontend.url}${config.frontend.routes.verify}/${token}`;

  // Prepare images
  let logoSrc = 'https://lafftale.online/image/Web/lafftale_logo_300x300.png';
  let headerSrc = 'https://lafftale.online/image/Web/header2.png';
  let footerSrc = 'https://lafftale.online/image/Web/header3.png';
  let backgroundSrc = 'https://lafftale.online/image/Web/Background.png';
  let attachments = [];

  if (!config.email.templates.useAbsoluteUrls) {
    // Include logo
    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.logo
    );
    logoSrc = 'cid:logo';
    attachments.push({
      filename: config.email.imagePaths.logo,
      path: logoPath,
      cid: 'logo',
    });

    // Include header
    const headerPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.header
    );
    headerSrc = 'cid:header';
    attachments.push({
      filename: config.email.imagePaths.header,
      path: headerPath,
      cid: 'header',
    });

    // Include footer
    const footerPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.footer
    );
    footerSrc = 'cid:footer';
    attachments.push({
      filename: config.email.imagePaths.footer,
      path: footerPath,
      cid: 'footer',
    });

    // Include background image
    const backgroundPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.background
    );
    backgroundSrc = 'cid:background';
    attachments.push({
      filename: config.email.imagePaths.background,
      path: backgroundPath,
      cid: 'background',
    });
  }
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Lafftale Online - Email Verification',
    html: createVerificationEmailTemplate(verifyUrl, logoSrc, headerSrc, footerSrc, backgroundSrc),
    attachments,
  };

  return transporter.sendMail(mailOptions);
};

// Send email for password reset
const sendPasswordResetEmail = async (email, token) => {
  // Create reset URL
  const resetUrl = `${config.frontend.url}${config.frontend.routes.reset}/${token}`;

  // Prepare images
  let logoSrc = 'https://lafftale.online/image/Web/lafftale_logo_300x300.png';
  let headerSrc = 'https://lafftale.online/image/Web/header2.png';
  let footerSrc = 'https://lafftale.online/image/Web/header3.png';
  let backgroundSrc = 'https://lafftale.online/image/Web/Background.png';
  let attachments = [];

  if (!config.email.templates.useAbsoluteUrls) {
    // Include logo
    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.logo
    );
    logoSrc = 'cid:logo';
    attachments.push({
      filename: config.email.imagePaths.logo,
      path: logoPath,
      cid: 'logo',
    });

    // Include header
    const headerPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.header
    );
    headerSrc = 'cid:header';
    attachments.push({
      filename: config.email.imagePaths.header,
      path: headerPath,
      cid: 'header',
    });

    // Include footer
    const footerPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.footer
    );
    footerSrc = 'cid:footer';
    attachments.push({
      filename: config.email.imagePaths.footer,
      path: footerPath,
      cid: 'footer',
    });

    // Include background image
    const backgroundPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.background
    );
    backgroundSrc = 'cid:background';
    attachments.push({
      filename: config.email.imagePaths.background,
      path: backgroundPath,
      cid: 'background',
    });
  }
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Lafftale Online - Reset Password',
    html: createPasswordResetEmailTemplate(resetUrl, logoSrc, headerSrc, footerSrc, backgroundSrc),
    attachments,
  };

  return transporter.sendMail(mailOptions);
};

function createVerificationEmailTemplate(verifyUrl, logoSrc, headerSrc, footerSrc, backgroundSrc) {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Email Verification</title>
      <style type="text/css">
        /* Basic styles that work in most email clients */
        body { margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; }
        table { border-spacing: 0; font-family: Arial, sans-serif; }
        td { padding: 0; }
        img { border: 0; }
        .content { width: 600px; max-width: 100%; }
        .header { padding: 40px 30px 20px 30px; background-color: #1e293b; background-image: url('${headerSrc}'); background-size: cover; background-position: center; text-align: center; }
        .header-logo { display: inline-block; }
        .header-title { color: #d4af37; font-size: 28px; font-weight: bold; margin-top: 20px; }
        .container { padding: 30px 30px 40px 30px; background-color: #111827; background-image: url('${backgroundSrc}'); background-size: cover; background-position: center; color: #e0e0e0; }
        .footer { padding: 20px 30px; background-color: #1e293b; background-image: url('${footerSrc}'); background-size: cover; background-position: center; text-align: center; color: #9ca3af; }
        .button { display: inline-block; padding: 12px 25px; background-color: #d4af37; color: #000000 !important; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0; }
        .text-center { text-align: center; }
        .signature { margin-top: 30px; color: #9ca3af; font-size: 14px; }
        /* Specific styles for Outlook */
        .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a;">
      <center>
        <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0f172a" style="background-color: #0f172a !important;">
          <tr>
            <td align="center" valign="top">
              <!-- Header -->
              <table class="content" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 100%;">
                <tr>
                  <td class="header" style="padding: 40px 30px 20px 30px; background-color: #1e293b !important; background-image: url('${headerSrc}'); background-size: cover; background-position: center; text-align: center;">
                    <img src="${logoSrc}" alt="Lafftale Online Logo" width="100" style="display: block; margin: 0 auto;" />
                    <div class="header-title" style="color: #d4af37; font-size: 28px; font-weight: bold; margin-top: 20px;">Lafftale Online</div>
                  </td>
                </tr>
                <!-- Main Content -->
                <tr>
                  <td class="container" style="padding: 30px 30px 40px 30px; background-color: #111827 !important; background-image: url('${backgroundSrc}'); background-size: cover; background-position: center; color: #e0e0e0;">
                    <p>Hello,</p>
                    <p>Thank you for registering with Lafftale Online! To complete your registration, please verify your email address by clicking the button below:</p>
                    
                    <div class="text-center" style="text-align: center;">
                      <a href="${verifyUrl}" class="button" style="display: inline-block; padding: 12px 25px; background-color: #d4af37; color: #000000 !important; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0;">Verify Email</a>
                    </div>
                    
                    <p>This verification link is valid for 24 hours. If you didn't create an account, you can ignore this email.</p>
                    
                    <div class="signature" style="margin-top: 30px; color: #9ca3af; font-size: 14px;">
                      <p>Best regards,<br>The Lafftale Online Team</p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td class="footer" style="padding: 20px 30px; background-color: #1e293b !important; background-image: url('${footerSrc}'); background-size: cover; background-position: center; text-align: center; color: #9ca3af;">
                    <p>&copy; ${new Date().getFullYear()} Lafftale Online. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
}

// Template for password reset email
function createPasswordResetEmailTemplate(resetUrl, logoSrc, headerSrc, footerSrc, backgroundSrc) {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Reset Password</title>
      <style type="text/css">
        /* Basic styles that work in most email clients */
        body { margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; }
        table { border-spacing: 0; font-family: Arial, sans-serif; }
        td { padding: 0; }
        img { border: 0; }
        .content { width: 600px; max-width: 100%; }
        .header { padding: 40px 30px 20px 30px; background-color: #1e293b; background-image: url('${headerSrc}'); background-size: cover; background-position: center; text-align: center; }
        .header-logo { display: inline-block; }
        .header-title { color: #d4af37; font-size: 28px; font-weight: bold; margin-top: 20px; }
        .container { padding: 30px 30px 40px 30px; background-color: #111827; background-image: url('${backgroundSrc}'); background-size: cover; background-position: center; color: #e0e0e0; }
        .footer { padding: 20px 30px; background-color: #1e293b; background-image: url('${footerSrc}'); background-size: cover; background-position: center; text-align: center; color: #9ca3af; }
        .button { display: inline-block; padding: 12px 25px; background-color: #d4af37; color: #000000 !important; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0; }
        .text-center { text-align: center; }
        .signature { margin-top: 30px; color: #9ca3af; font-size: 14px; }
        /* Specific styles for Outlook */
        .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a;">
      <center>
        <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0f172a" style="background-color: #0f172a !important;">
          <tr>
            <td align="center" valign="top">
              <!-- Header -->
              <table class="content" cellpadding="0" cellspacing="0" border="0" style="width: 600px; max-width: 100%;">
                <tr>
                  <td class="header" style="padding: 40px 30px 20px 30px; background-color: #1e293b !important; background-image: url('${headerSrc}'); background-size: cover; background-position: center; text-align: center;">
                    <img src="${logoSrc}" alt="Lafftale Online Logo" width="100" style="display: block; margin: 0 auto;" />
                    <div class="header-title" style="color: #d4af37; font-size: 28px; font-weight: bold; margin-top: 20px;">Lafftale Online</div>
                  </td>
                </tr>
                <!-- Main Content -->
                <tr>
                  <td class="container" style="padding: 30px 30px 40px 30px; background-color: #111827 !important; background-image: url('${backgroundSrc}'); background-size: cover; background-position: center; color: #e0e0e0;">
                    <p>Hello,</p>
                    <p>You have requested to reset your password for your Lafftale Online account. Please click the button below to reset your password:</p>
                    
                    <div class="text-center" style="text-align: center;">
                      <a href="${resetUrl}" class="button" style="display: inline-block; padding: 12px 25px; background-color: #d4af37; color: #000000 !important; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0;">Reset Password</a>
                    </div>
                    
                    <p>This link is valid for one hour. If you did not request a password reset, you can ignore this email.</p>
                    
                    <div class="signature" style="margin-top: 30px; color: #9ca3af; font-size: 14px;">
                      <p>Best regards,<br>The Lafftale Online Team</p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td class="footer" style="padding: 20px 30px; background-color: #1e293b !important; background-image: url('${footerSrc}'); background-size: cover; background-position: center; text-align: center; color: #9ca3af;">
                    <p>&copy; ${new Date().getFullYear()} Lafftale Online. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
}

// Send email for account deletion confirmation
const sendAccountDeletionEmail = async (email, token, gameAccountName) => {
  // Create deletion confirmation URL
  const confirmUrl = `${config.frontend.url}/confirm-account-deletion/${token}`;

  // Prepare images
  let logoSrc = 'https://lafftale.online/image/Web/lafftale_logo_300x300.png';
  let headerSrc = 'https://lafftale.online/image/Web/header2.png';
  let footerSrc = 'https://lafftale.online/image/Web/header3.png';
  let backgroundSrc = 'https://lafftale.online/image/Web/Background.png';
  let attachments = [];

  if (!config.email.templates.useAbsoluteUrls) {
    // Include logo
    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.logo
    );
    logoSrc = 'cid:logo';
    attachments.push({
      filename: config.email.imagePaths.logo,
      path: logoPath,
      cid: 'logo',
    });

    // Include header
    const headerPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.header
    );
    headerSrc = 'cid:header';
    attachments.push({
      filename: config.email.imagePaths.header,
      path: headerPath,
      cid: 'header',
    });

    // Include footer
    const footerPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.footer
    );
    footerSrc = 'cid:footer';
    attachments.push({
      filename: config.email.imagePaths.footer,
      path: footerPath,
      cid: 'footer',
    });

    // Include background
    const backgroundPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'image',
      'Web',
      config.email.imagePaths.background
    );
    backgroundSrc = 'cid:background';
    attachments.push({
      filename: config.email.imagePaths.background,
      path: backgroundPath,
      cid: 'background',
    });
  }

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Lafftale Online - Game Account Deletion Confirmation',
    html: createAccountDeletionEmailTemplate(
      confirmUrl,
      gameAccountName,
      logoSrc,
      headerSrc,
      footerSrc,
      backgroundSrc
    ),
    attachments,
  };

  return transporter.sendMail(mailOptions);
};

// Template for account deletion confirmation email
function createAccountDeletionEmailTemplate(
  confirmUrl,
  gameAccountName,
  logoSrc,
  headerSrc,
  footerSrc,
  backgroundSrc
) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Game Account Deletion Confirmation</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0f172a; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; }
        .header { background-image: url('${headerSrc}'); background-size: cover; background-position: center; padding: 40px 20px; text-align: center; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 40px 30px; background-color: #1e293b; color: #e2e8f0; }
        .warning-box { background-color: #dc2626; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .warning-title { color: #fef2f2; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .warning-text { color: #fef2f2; line-height: 1.6; }
        .account-info { background-color: #374151; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .confirm-btn { display: inline-block; background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .confirm-btn:hover { background-color: #b91c1c; }
        .footer { padding: 20px 30px; background-color: #1e293b; background-image: url('${footerSrc}'); background-size: cover; background-position: center; text-align: center; color: #9ca3af; }
        .expiry-info { background-color: #1f2937; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body style="background-image: url('${backgroundSrc}'); background-size: cover; background-position: center; background-attachment: fixed;">
      <center>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(15, 23, 42, 0.9);">
          <tr>
            <td>
              <table class="container" cellpadding="0" cellspacing="0" border="0">
                <!-- Header -->
                <tr>
                  <td class="header">
                    <img src="${logoSrc}" alt="Lafftale Online" class="logo">
                    <h1 style="color: #fbbf24; margin: 20px 0 0 0;">Game Account Deletion</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td class="content">
                    <div class="warning-box">
                      <div class="warning-title">⚠️ DANGER - Account Deletion Request</div>
                      <div class="warning-text">
                        You have requested to permanently delete your game account. This action is IRREVERSIBLE and will result in the complete loss of all characters, items, and progress.
                      </div>
                    </div>

                    <div class="account-info">
                      <strong>Game Account to be deleted:</strong><br>
                      <span style="color: #fbbf24; font-size: 18px;">${gameAccountName}</span>
                    </div>

                    <p style="color: #e2e8f0; line-height: 1.6;">
                      If you are certain you want to proceed with deleting this game account, click the confirmation button below:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${confirmUrl}" class="confirm-btn">CONFIRM ACCOUNT DELETION</a>
                    </div>

                    <div class="expiry-info">
                      <strong>⏰ Important:</strong> This confirmation link will expire in 1 hour for security reasons.
                    </div>

                    <p style="color: #9ca3af; line-height: 1.6;">
                      <strong>What will be deleted:</strong><br>
                      • All characters and their equipment<br>
                      • All in-game currency and items<br>
                      • Character progression and achievements<br>
                      • Guild membership and relationships<br>
                      • All game-related data
                    </p>

                    <p style="color: #9ca3af; line-height: 1.6;">
                      If you did not request this deletion, please ignore this email and contact our support team immediately.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td class="footer">
                    <p>&copy; ${new Date().getFullYear()} Lafftale Online. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    </html>
  `;
}

// Exports
const emailUtils = {
  sendPasswordResetEmail,
  generateToken,
  sendVerificationEmail,
  sendAccountDeletionEmail,
};

module.exports = emailUtils;
