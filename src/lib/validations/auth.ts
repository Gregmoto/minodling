import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken"),
});

export const registerSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken"),
  username: z
    .string()
    .min(3, "Användarnamn måste vara minst 3 tecken")
    .max(30, "Användarnamn får max vara 30 tecken")
    .regex(/^[a-zA-Z0-9_-]+$/, "Användarnamn får bara innehålla bokstäver, siffror, _ och -"),
  displayName: z.string().min(2, "Namn måste vara minst 2 tecken").max(50).optional(),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url("Ogiltig URL").optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
