// Simple test function for email sending
const testEmail = async (recipientEmail) => {
  console.log('Starting email test...');
  console.log('Email configuration:');
  console.log(`- Host: ${process.env.EMAIL_HOST || 'sunny_shooterboy@web.de'}`);
  console.log(`- Port: ${process.env.EMAIL_PORT || 587}`);
  console.log(`- Secure: ${process.env.EMAIL_SECURE === 'true'}`);
  console.log(`- User: ${process.env.EMAIL_USER || 'example@example.com'}`);  
  console.log(`- Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    try {
    const emailModule = require('./email');
    const testToken = emailModule.generateToken();
    // Use the provided recipient or fall back to configuration
    const testRecipient = recipientEmail || process.env.TEST_EMAIL || process.env.EMAIL_USER;
    
    console.log(`Sending test email to: ${testRecipient}`);
    
    await emailModule.sendVerificationEmail(testRecipient, testToken);
    
    console.log('Test email sent successfully!');
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
};

// Run the test if this file is called directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  // Check if an email address was provided as an argument
  const recipientEmail = process.argv[2]; // Takes the 3rd argument from the command line
  
  if (recipientEmail) {
    console.log(`Using provided email address: ${recipientEmail}`);
  } else {
    console.log(`No email address provided. Using default from configuration.`);
  }
  
  testEmail(recipientEmail)
    .then((success) => {
      console.log('Email test completed.');
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Email test failed:', err);
      process.exit(1);
    });
}

module.exports = { testEmail };
