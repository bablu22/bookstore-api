import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: 'smtp_user',
        pass: 'smtp_password'
      }
    });

    const mailOptions = {
      from: 'user@example.com',
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
  return true;
};
