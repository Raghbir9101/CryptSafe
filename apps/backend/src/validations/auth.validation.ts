import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    userName: z.string().min(3),
    password: z.string().min(8)
  })
});

export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6)
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
}); 