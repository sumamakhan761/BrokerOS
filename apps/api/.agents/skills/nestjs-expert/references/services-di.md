# Services & Dependency Injection (BrokerOS)

## Core Guidelines
1. **Prisma Only**: We use `PrismaService` for all database interactions. Do not use TypeORM, Mongoose, or raw SQL.
2. **Import Path**: Always import PrismaService from the singleton path: `import { PrismaService } from '../../lib/database/prisma.service.js';`
3. **Transactions**: Use `this.prisma.$transaction(async (tx) => { ... })` for multi-model writes.
4. **Exceptions**: Throw standard `@nestjs/common` exceptions (`NotFoundException`, `BadRequestException`, `ForbiddenException`).

## Example Service
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { CreateFeatureDto } from './dto/features.dto.js';

@Injectable()
export class FeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllFeatures(userId: string) {
    return this.prisma.feature.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createFeature(userId: string, data: CreateFeatureDto) {
    // Transaction example
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      return tx.feature.create({
        data: {
          title: data.title,
          description: data.description,
          userId
        }
      });
    });
  }
}
```
