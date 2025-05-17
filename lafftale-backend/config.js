// Konfigurationen für die Anwendung
module.exports = {
  // E-Mail-Konfiguration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@silkroad-legends.com',
    
    // Bildpfade für E-Mail-Vorlagen
    // Im Produktionsmodus können diese Pfade auf einen CDN oder anderen öffentlichen Speicherort verweisen
    imagePaths: {
      // Setze IMAGE_PATH_BASE in .env, um den Basispfad zu überschreiben (für Produktion)
      base: process.env.IMAGE_PATH_BASE || './public/image/Web',
      
      header: 'header2.png',
      logo: 'lafftale_logo_300x300.png',
      background: 'Background.png',
      footer: 'header3.png'
    },
    
    // E-Mail-Template-Einstellungen
    templates: {
      // Wenn true, werden absolute URLs für Bilder verwendet, andernfalls werden Bilder als Anhänge gesendet
      useAbsoluteUrls: process.env.USE_ABSOLUTE_URLS === 'true',
      
      // Basis-URL für Bilder, wenn absolute URLs verwendet werden
      // z.B. 'https://lafftale.online' oder 'https://cdn.silkroad-legends.com'
      imageBaseUrl: process.env.IMAGE_BASE_URL || 'https://lafftale.online'
    }
  },
  
  // Frontend-URLs
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    routes: {
      verify: '/verify-email',
      reset: '/reset-password'
    }
  },
  
  // Token-Konfiguration
  tokens: {
    // Gültigkeitsdauer für Tokens in Millisekunden
    verificationExpiry: 24 * 60 * 60 * 1000, // 24 Stunden
    passwordResetExpiry: 60 * 60 * 1000      // 1 Stunde
  }
};
