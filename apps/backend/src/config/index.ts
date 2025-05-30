import dotenv from 'dotenv';
dotenv.config();

export const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: '1h'
  }
}; 