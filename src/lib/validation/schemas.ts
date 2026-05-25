import { z } from "zod";

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "auth.validation.usernameRequired")
    .min(3, "auth.validation.usernameMinLength"),
  password: z
    .string()
    .min(1, "auth.validation.passwordRequired")
    .min(6, "auth.validation.passwordMinLength"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
