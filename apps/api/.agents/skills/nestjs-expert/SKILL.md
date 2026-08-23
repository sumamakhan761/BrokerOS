---
name: nestjs-expert
description: Creates and configures NestJS modules, controllers, services, DTOs, and tests for BrokerOS backend architecture. Use when building NestJS REST APIs, implementing dependency injection with Prisma, scaffolding modular architecture, or working with .module.ts, .controller.ts, and .service.ts files. Invoke for validation, controllers, and unit testing in the BrokerOS backend.

metadata:
  author: sumama
  triggers: NestJS, Nest, Node.js backend, TypeScript backend, dependency injection, controller, service, module, prisma
  role: specialist
  scope: implementation
  output-format: code
---

# NestJS Expert (BrokerOS Custom)

Senior NestJS specialist with deep expertise in the BrokerOS backend architecture, utilizing Better Auth, Prisma, and Class Validator.

## Core Workflow

1. **Analyze requirements** — Identify modules, endpoints, entities, and relationships.
2. **Design structure** — Plan module organization and inter-module dependencies.
3. **Implement** — Create modules, services, and controllers with proper DI wiring (PrismaService).
4. **Validate** — Add strict validation DTOs using `class-validator`. No Swagger allowed.
5. **Verify** — Run `npx tsc --noEmit` to confirm typings.
6. **Test** — Write unit tests for services using the mandatory BrokerOS mock block.

## Reference Guide

Load detailed guidance based on context:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Controllers | `references/controllers-routing.md` | Creating controllers, routing, accessing user via Better Auth |
| Services | `references/services-di.md` | Services, dependency injection, Prisma usage |
| DTOs | `references/dtos-validation.md` | Validation, class-validator, strict payload typing |
| Testing | `references/testing-patterns.md` | Unit tests, mandatory Prisma mocking blocks |

## Code Examples

### Controller

```typescript
import { Controller, Post, Body, Req } from '@nestjs/common';
import { FeaturesService } from './features.service.js';
import { CreateFeatureDto } from './dto/features.dto.js';

@Controller('api/features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post()
  create(@Req() req: any, @Body() body: CreateFeatureDto) {
    // req.user is guaranteed by global Better Auth APP_GUARD
    return this.featuresService.create(req.user?.id, body);
  }
}
```

### DTO

```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

### Service with Prisma Injection

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { CreateFeatureDto } from './dto/features.dto.js';

@Injectable()
export class FeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateFeatureDto) {
    return this.prisma.feature.create({
      data: { ...data, userId }
    });
  }
}
```

## Constraints

### MUST DO
- Use `@Injectable()` and constructor injection for all services.
- Always inject `PrismaService` from `../../lib/database/prisma.service.js`.
- Validate all inputs with `class-validator` decorators on DTOs.
- Extract user information via `@Req() req: any` in controllers.
- Throw typed HTTP exceptions (`NotFoundException`, `BadRequestException`) in services.
- Place the mandatory `jest.mock()` block at the top of every single `.spec.ts` file.

### MUST NOT DO
- **NO SWAGGER**: Do not use `@ApiProperty`, `@ApiTags`, or `@nestjs/swagger`.
- **NO TYPEORM**: Do not use TypeORM, Repositories, or `@InjectRepository`.
- **NO PASSPORT/GUARDS**: Do not use `@UseGuards(AuthGuard)`. Better Auth is global.
- Use `any` type for request bodies. Always use DTOs.
- Skip the mandatory mock block in spec files, as it will crash tests.

## Output Templates

When implementing a NestJS feature, provide in this order:
1. Module definition (`.module.ts`)
2. Controller (`.controller.ts`)
3. Service with Prisma (`.service.ts`)
4. DTOs with `class-validator` (`dto/*.dto.ts`)
5. Unit tests with mandatory mock block (`*.service.spec.ts`)
