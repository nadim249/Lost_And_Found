import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lost-and-found-secret";

// Sign token (valid 7d)
export const generateToken = (userId, role) => {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: "7d" });
};

// Verify token payload
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Compatibility aliases
export const signAccessToken = generateToken;
export const signRefreshToken = generateToken;
export const verifyAccessToken = verifyToken;
export const verifyRefreshToken = verifyToken;
