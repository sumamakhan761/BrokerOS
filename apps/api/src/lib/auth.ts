import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prismaClient } from './database/prisma-client.js';
import { username, bearer } from 'better-auth/plugins';
import { createAuthMiddleware } from 'better-auth/api';

const authConfig = {
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.MOBILE_URL || 'exp://192.168.0.105:8081',
    'crm://',
  ],
  database: prismaAdapter(prismaClient, {
    provider: 'postgresql',
  }),
  advanced: {
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: true,
      },
      phoneNumber: {
        type: 'string',
        required: true,
      },
      roleId: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [username(), bearer()],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Intercept the login request
      if (ctx.path === '/sign-in/email') {
        const { email: identifier } = ctx.body || {};
        if (!identifier) {
          return;
        }

        // Try to find the user by email, phoneNumber, or username
        const user = await prismaClient.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { phoneNumber: identifier },
              { username: identifier },
            ],
          },
        });

        // If a user is found, resolve the login identifier to their registered email
        if (user && user.email && user.email !== identifier) {
          return {
            context: {
              ...ctx,
              body: {
                ...ctx.body,
                email: user.email,
              },
            },
          };
        }
      }
    }),
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig) as any;
