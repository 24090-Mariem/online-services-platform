const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: smtpUser && smtpPass ? {
    user: smtpUser,
    pass: smtpPass,
  } : undefined,
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

async function sendWelcomeWithLink(to, nom, prenom, setupLink) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Bienvenue sur notre plateforme de services',
    text: `Bonjour ${prenom} ${nom},\n\nVotre compte technicien a été approuvé.\n\nCréez votre mot de passe en cliquant sur ce lien : ${setupLink}\n\nCe lien expire dans 3 heures.\n\nCordialement,\nL'équipe de la plateforme`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Bienvenue ${prenom} ${nom} !</h2>
        <p>Votre compte technicien a été <strong style="color: #22c55e;">approuvé</strong>.</p>
        <p>Pour finaliser votre inscription, créez votre mot de passe sécurisé :</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${setupLink}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
            Créer mon mot de passe
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Ce lien expire dans 3 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Cordialement,<br>L'équipe de la plateforme</p>
      </div>
    `,
  });
}

async function sendWelcomeEmail(to, nom, prenom) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Bienvenue sur notre plateforme de services',
    text: `Bonjour ${prenom} ${nom},\n\nVotre compte a été créé avec succès.\n\nCordialement,\nL'équipe de la plateforme`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Bienvenue ${prenom} ${nom} !</h2>
        <p>Votre compte a été créé avec succès.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Cordialement,<br>L'équipe de la plateforme</p>
      </div>
    `,
  });
}

async function sendDemandeConfirmation(to, nom, prenom) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Confirmation de votre demande d\'inscription',
    text: `Bonjour ${prenom} ${nom},\n\nNous avons bien reçu votre demande d'inscription en tant que technicien.\n\nVotre demande est en cours de traitement par notre équipe. Vous recevrez un email dès qu'elle sera approuvée avec un lien pour créer votre mot de passe.\n\nCordialement,\nL'équipe ${process.env.APP_NAME || 'CodevaServices'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Demande reçue !</h2>
        <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
        <p>Nous avons bien reçu votre demande d'inscription en tant que technicien.</p>
        <div style="background: #fef9c3; border: 1px solid #facc15; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #854d0e;">
            <strong>⏳ En attente de validation</strong><br>
            Votre demande est en cours de traitement par notre équipe. Vous recevrez un email dès qu'elle sera approuvée.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Cordialement,<br>L'équipe ${process.env.APP_NAME || 'CodevaServices'}</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendWelcomeWithLink, sendDemandeConfirmation };
