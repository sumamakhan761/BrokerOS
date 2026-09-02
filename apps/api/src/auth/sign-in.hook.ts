import { Injectable } from '@nestjs/common';
import {
  Hook,
  BeforeHook,
  AuthHookContext,
} from '@thallesp/nestjs-better-auth';
import { prismaClient as prisma } from '../lib/database/prisma-client.js';
import { APIError } from 'better-auth/api';

@Hook()
@Injectable()
export class SignInHook {
  @BeforeHook('/sign-in/email')
  async handle(ctx: AuthHookContext) {
    const body = ctx.body;

    console.log('LOGIN ATTEMPT BODY:', JSON.stringify(body, null, 2));

    const email = body?.email;
    const phoneNumber = body?.phoneNumber;
    const roleId = body?.roleId;

    if (!email || !phoneNumber || !roleId) {
      throw new APIError('BAD_REQUEST', {
        message:
          'Email, Phone Number, and Role selection are all required for login.',
      });
    }

    // Strict Multi-Factor Identity Check
    // We check if a user exists with this EXACT combination of Email + Phone Number + Role
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        phoneNumber: phoneNumber,
        roleId: roleId,
      },
    });

    if (!user) {
      // If the combination doesn't match perfectly, we explicitly throw an error
      // Better Auth handles throwing errors back to the client as 400 Bad Request
      throw new APIError('FORBIDDEN', {
        message:
          'Identity mismatch: The provided Email, Phone Number, and Role combination is invalid.',
      });
    }

    // If it matches perfectly, Better Auth will continue to check the password and log them in!
  }
}
