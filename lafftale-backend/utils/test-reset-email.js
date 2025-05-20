// Simple test function for password reset email sending
const testResetEmail = async (recipientEmail) => {
  console.log('Starting password reset email test...');
  console.log('Email configuration:');
  console.log(`- Host: ${process.env.EMAIL_HOST || 'smtp.example.com'}`);
  console.log(`- Port: ${process.env.EMAIL_PORT || 587}`);
  console.log(`- Secure: ${process.env.EMAIL_SECURE === 'true'}`);
  console.log(`- User: ${process.env.EMAIL_USER || 'example@example.com'}`);  
  console.log(`- Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    try {
    const emailModule = require('./email');
    const testToken = emailModule.generateToken();
    // Use the provided recipient or fall back to configuration
    const testRecipient = recipientEmail || process.env.TEST_EMAIL || process.env.EMAIL_USER;
    
    console.log(`Sending password reset test email to: ${testRecipient}`);
    
    await emailModule.sendPasswordResetEmail(testRecipient, testToken);
    
    console.log('Password reset test email sent successfully!');
    return true;
  } catch (error) {
    console.error('Error sending password reset test email:', error);
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
  
  testResetEmail(recipientEmail)
    .then((success) => {
      console.log('Password reset email test completed.');
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Password reset email test failed:', err);
      process.exit(1);
    });
}

module.exports = { testResetEmail };
