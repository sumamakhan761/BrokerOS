---
name: build-backend-feature
description: "Use this skill whenever the user asks to create a new backend feature, API endpoint, or modify an existing backend module. It enforces strict DTO, testing, and compilation standards."
---

# Build Backend Feature Skill

Whenever you are tasked with creating a new feature or modifying an existing module in the backend, you MUST follow this strict implementation loop. 

## 1. DTOs First (Input Validation)
Never use inline typings or `any` for request payloads. 
- Create or update a DTO file in the `dto/` folder (e.g., `feature.dto.ts`).
- Define strict classes for all incoming `@Body()`, `@Query()`, and `@Param()` payloads.

## 2. Core Logic (Controller & Service)
- **Controller**: Inject the service. Route the HTTP requests and map the incoming payloads explicitly to the DTOs created in Step 1.
- **Service**: Implement the core business logic. Inject `PrismaService` for DB operations. Never change an existing service method signature to break other modules; pass the DTO object or specific fields.

## 3. Spec Files (Unit Testing)
You must ALWAYS write or update the corresponding `.spec.ts` file for any service you modify or create.
- Setup `Test.createTestingModule`.
- Explicitly mock all injected dependencies (e.g., `PrismaService`, `NotificationsService`, `Expo`).
- Ensure the test suite can at minimum instantiate the service (`should be defined`).

## 4. E2E Testing
For any new controller endpoints or critical flows, you **MUST** write or update the End-to-End (E2E) test file (`.e2e-spec.ts`). 
Before doing so, you **MUST** read and follow the instructions in the `write-e2e-tests` skill:
`.agents/skills/write-e2e-tests/SKILL.md`

## 5. Required Implementation Patterns (`nestjs-expert`)
You **MUST** follow the strict BrokerOS implementation patterns. Before writing the code for the above steps, review the relevant `nestjs-expert` documentation:
- **Main Constraints**: Read `.agents/skills/nestjs-expert/SKILL.md` (Crucial MUST DO / MUST NOT DO rules)
- **Controllers/Routing**: Read `.agents/skills/nestjs-expert/references/controllers-routing.md`
- **DTOs/Validation**: Read `.agents/skills/nestjs-expert/references/dtos-validation.md`
- **Services/Prisma**: Read `.agents/skills/nestjs-expert/references/services-di.md`
- **Spec Files**: Read `.agents/skills/nestjs-expert/references/testing-patterns.md`
- **E2E Testing**: Read `.agents/skills/write-e2e-tests/SKILL.md`

## 6. Verification Loop
Before concluding your task, you MUST run these terminal commands sequentially to prove the code is structurally sound:
1. **Type Check**: Run `pnpm --filter @brokeros/api exec tsc --noEmit` from the root directory. Fix any type errors before proceeding.
2. **Unit Tests**: Run `pnpm --filter @brokeros/api test src/<module-folder>` to ensure the spec files compile and pass. Fix any mocking errors.
3. **E2E Tests**: If you modified or created E2E tests, run `pnpm --filter @brokeros/api test:e2e` (or the specific test file) to ensure they pass.

Do not ask the user for permission to run these verification commands. Run them proactively.
