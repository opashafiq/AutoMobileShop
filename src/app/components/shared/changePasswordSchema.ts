// Shared zod schema for the change-password form. Used by both the compact
// card in account-settings (AccountTab) and the standalone /change-password
// page so the validation rules stay in one place.
import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    // Trimmed to stay consistent with the login form, which also trims
    // credentials before authenticating (see AuthLogin) — otherwise a
    // password saved with surrounding whitespace could never be used to
    // sign in again.
    currentPassword: z.string().trim().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .trim()
      .min(6, 'New password must be at least 6 characters')
      .max(128, 'New password must not exceed 128 characters'),
    confirmPassword: z.string().trim().min(1, 'Please confirm the new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  })

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
