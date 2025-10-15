// Configurations for the application
module.exports = {
  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@lafftale.online',

    // Image paths for email templates
    // In production mode, these paths can point to a CDN or other public storage location
    imagePaths: {
      // Set IMAGE_PATH_BASE in .env to override the base path (for production)
      base: process.env.IMAGE_PATH_BASE || './public/image/Web',

      header: 'header2.png',
      logo: 'lafftale_logo_300x300.png',
      background: 'Background.png',
      footer: 'header3.png',
    },

    // Email template settings
    templates: {
      // If true, absolute URLs are used for images, otherwise images are sent as attachments
      useAbsoluteUrls: process.env.USE_ABSOLUTE_URLS !== 'false', // Default to true

      // Base URL for images when using absolute URLs
      // e.g. 'https://lafftale.online' or 'https://cdn.silkroad-legends.com'
      imageBaseUrl: process.env.IMAGE_BASE_URL || 'https://lafftale.online',
    },
  },

  // Frontend URLs
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    routes: {
      verify: '/verify-email',
      reset: '/reset-password',
    },
  },

  // Token configuration
  tokens: {
    // Token validity duration in milliseconds
    verificationExpiry: 24 * 60 * 60 * 1000, // 24 hours
    passwordResetExpiry: 60 * 60 * 1000, // 1 hour
  },
};
