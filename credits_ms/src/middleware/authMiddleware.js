const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

const authMiddleware = ClerkExpressWithAuth({
  apiKey: process.env.CLERK_API_KEY,
  jwtKey: process.env.CLERK_JWT_KEY,
});

module.exports = authMiddleware;
