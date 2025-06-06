import nodemailer from 'nodemailer';

interface EmailCredentials {
  userName: string;
  userPass: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (credentials: EmailCredentials, options: EmailOptions) => {
  try {
    // Create transporter with dynamic credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: credentials.userName,
        pass: credentials.userPass
      }
    });

    // Send mail
    const info = await transporter.sendMail({
      from: credentials.userName,
      ...options
    });

    return info;
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}; 