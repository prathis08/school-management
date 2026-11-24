import { randomBytes } from "crypto";

/**
 * Generate a strong, human-shareable temporary password.
 * Used when an admin creates a user or resets their password.
 */
export const generateTemporaryPassword = () => {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(14);
  let password = "";
  for (let i = 0; i < 14; i += 1) {
    password += alphabet[bytes[i] % alphabet.length];
  }
  return `${password}!9`;
};
