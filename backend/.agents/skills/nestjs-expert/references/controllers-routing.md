# Controllers & Routing (BrokerOS)

## Core Guidelines
1. **No Swagger**: Do not use `@ApiTags`, `@ApiOperation`, or any other `@nestjs/swagger` decorators.
2. **Authentication is Global**: Do not use `@UseGuards(AuthGuard)`. The entire backend is protected globally by Better Auth via the `APP_GUARD`.
3. **Getting the User ID**: Since endpoints are authenticated, inject `@Req() req: any` into the controller method and read `req.user?.id`.
4. **Standard Routing**: Use standard decorators `@Controller('api/module-name')`, `@Get()`, `@Post()`, `@Patch()`, `@Delete()`.

## Example Controller
```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query } from '@nestjs/common';
import { FeaturesService } from './features.service.js';
import { CreateFeatureDto, UpdateFeatureDto } from './dto/features.dto.js';

@Controller('api/features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get()
  getAllFeatures(@Req() req: any) {
    // `req.user` is guaranteed by Better Auth global guard
    return this.featuresService.getAllFeatures(req.user?.id);
  }

  @Post()
  createFeature(@Req() req: any, @Body() body: CreateFeatureDto) {
    return this.featuresService.createFeature(req.user?.id, body);
  }
}
```
