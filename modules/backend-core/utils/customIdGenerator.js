/**
 * Generate a custom ID with prefix
 * @param {string} prefix - The prefix for the ID (default: "ID")
 * @returns {string} - Generated custom ID
 */
export const generateCustomIdWithPrefix = (prefix = "ID") => {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 100000);
  return `${prefix}${timestamp}${randomNumber}`;
};
