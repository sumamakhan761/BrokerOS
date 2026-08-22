# DTOs & Validation (BrokerOS)

## Core Guidelines
1. **Strict Class Validator**: All incoming data (POST, PATCH, PUT) must be strictly validated using `class-validator` and `class-transformer`.
2. **No Swagger**: Do not use `@ApiProperty` or any other Swagger decorators in DTO files.
3. **Location**: DTOs should be placed in a `dto/` folder inside the module (e.g., `src/leads/dto/leads.dto.ts`).

## Example DTO File
```typescript
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateFeatureDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  amount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```
