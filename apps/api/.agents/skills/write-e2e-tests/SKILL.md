---
name: write-e2e-tests
description: "Use this skill whenever the user asks to write, update, or manage End-to-End (E2E) tests for the NestJS backend. Enforces strict test database isolation, Better Auth workflows, and database truncation teardowns."
---

# Write Backend E2E Tests

Whenever you are tasked with creating or modifying End-to-End (E2E) tests in the NestJS backend, you MUST follow this strict implementation guide.

## 1. Scope & Location
- **One E2E file per major Controller:** If you are testing the `LeadsController`, the file should be `apps/api/test/leads.e2e-spec.ts`.
- **Focus on the Flow:** E2E tests are meant to test the "happy path" (e.g., login -> create lead -> fetch lead) and major "failure paths" (e.g., unauthorized access, DTO validation failure). Do not test every minor permutation; leave that to the unit tests (`*.spec.ts`).

## 2. The Test Database (CRITICAL)
**Never run E2E tests against the production database.**
E2E tests must be completely isolated.
1. The `.env.test` file (or `DATABASE_URL_TEST` environment variable) must be used.
2. The test database must be migrated to the latest schema using `pnpm --filter @brokeros/prisma db:migrate`.
3. If basic reference data is needed, `pnpm --filter @brokeros/prisma db:seed` should be executed on the test database beforehand.

## 3. Setup and Teardown Strategy
You must ensure the database is clean for every test suite to prevent test pollution. We use the **Table Truncation** method between suites.

### Setup Snippet Example:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/lib/database/prisma.service.js';

describe('FeatureController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Crucial: Apply the same validation pipes as main.ts
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Truncate tables between tests (Example snippet)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Feature", "AnotherTable" CASCADE;`);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 4. Authentication Strategy (Better Auth)
All BrokerOS routes are protected by Better Auth. To hit protected routes in E2E tests, you must obtain a valid session cookie.

1. Do NOT mock the guard if testing a real E2E flow.
2. **Instead, hit the Auth endpoint first**: Create a test user in the database (or use seeded users) and make a login request via Supertest to grab the `set-cookie` header.

```typescript
let authCookie: string[];

beforeAll(async () => {
  // ... app init ...
  
  // Create a test user via Prisma directly
  await prisma.user.create({
    data: {
      email: 'test@brokeros.com',
      name: 'Test Admin',
      role: 'ADMIN',
      // Provide valid hash format required by Better Auth
    }
  });

  // Login to get the session cookie
  const loginRes = await request(app.getHttpServer())
    .post('/api/auth/sign-in/email')
    .send({ email: 'test@brokeros.com', password: 'password123' })
    .expect(200);

  authCookie = loginRes.headers['set-cookie'];
});

it('should access protected route', () => {
  return request(app.getHttpServer())
    .get('/api/protected-route')
    .set('Cookie', authCookie)
    .expect(200);
});
```

## 5. Assertions
- Always use `supertest` for HTTP assertions.
- Verify status codes (e.g., `201` for creation, `401` for unauthorized, `400` for bad DTOs).
- Verify the body matches the expected output shape, not just a blind database check.

## 6. Required Reference Skills
When building E2E tests, rely on these existing skills for architectural standards:
- **`nestjs-expert`**: For controller and DI standards.
- **`better-auth-best-practices`**: For deeper auth plugin or schema requirements.
- **`prisma-client-api`**: For complex querying or seeding inside tests.

## 7. Execution
To verify the E2E tests work, run from the repo root:
```bash
pnpm --filter @brokeros/api test:e2e
```
Or for a specific file:
```bash
pnpm --filter @brokeros/api test:e2e test/leads.e2e-spec.ts
```

## 8. Mocking External Services
If the flow you are testing interacts with a 3rd-party service (like Stripe, AWS S3, or Twilio), you should **not** make real network calls in E2E tests. Instead, override the provider before compiling the testing module:

```typescript
const moduleFixture: TestingModule = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(StripeService)
  .useValue({ charge: jest.fn().mockResolvedValue({ status: 'success' }) })
  .compile();
```
