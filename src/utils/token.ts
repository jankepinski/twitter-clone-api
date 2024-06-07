export const generateToken = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from({ length: 64 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};
