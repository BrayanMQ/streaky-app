import { z } from 'zod';
import { HABIT_COLORS } from './habitColors';

/**
 * Validation schemas using Zod
 * Centralized validation logic for all forms in the application
 */

// Valid color values from HABIT_COLORS
const validColorValues = HABIT_COLORS.map(color => color.value);

/**
 * Authentication schemas
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

/**
 * Habit schemas
 */
export const habitSchema = z.object({
  title: z
    .string()
    .min(1, 'Habit title is required')
    .min(2, 'Minimum 2 characters required')
    .max(100, 'Maximum 100 characters allowed')
    .refine((val) => val.trim().length >= 2, {
      message: 'Habit title cannot be only whitespace',
    }),
  color: z
    .string()
    .refine((val) => validColorValues.includes(val), {
      message: 'Invalid color selected',
    }),
  icon: z.string().nullable().optional(),
  frequency: z.any().nullable().optional(),
});

/**
 * Settings schemas
 */
export const changeEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

// Type exports for TypeScript
export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

