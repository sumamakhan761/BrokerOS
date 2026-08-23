import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@brokeros/prisma";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    // This class is a token/type wrapper around the shared prismaClient instance.
    // In PrismaModule, we register this token to provide the instantiated prismaClient.
    // We pass {} as any to satisfy TypeScript's constructor requirement.
    super({} as any);
  }
}