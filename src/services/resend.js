
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  const response = await resend.emails.send({
    from: 'SplashWash <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
  return response;
}

module.exports = sendEmail;

if (require.main === module) {
  sendEmail(
    process.env.TEST_EMAIL,
    'SplashWash Test',
    '<p>Your email notifications are working!</p>'
  )
    .then((result) => console.log('Email sent:', result))
    .catch((err) => console.error('Resend error:', err.message));
}
