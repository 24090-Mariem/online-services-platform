const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordResetEmail(to, resetCode) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Code de réinitialisation de mot de passe',
    text: `Votre code de réinitialisation est : ${resetCode}\n\nCe code expire dans 3 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #6366f1; margin: 24px 0;">
          ${resetCode}
        </p>
        <p style="color: #6b7280; font-size: 14px;">Ce code expire dans 3 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
