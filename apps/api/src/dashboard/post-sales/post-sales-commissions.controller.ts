import { Controller, Get, Param, Put, Req, Body } from '@nestjs/common';
import { PostSalesCommissionsService } from './post-sales-commissions.service.js';
import { ReceiveCommissionDto } from './dto/post-sales.dto.js';

@Controller('api/dashboard/post-sales/commissions')
export class PostSalesCommissionsController {
  constructor(
    private readonly commissionsService: PostSalesCommissionsService,
  ) {}

  @Get()
  async getCommissions(@Req() req: any) {
    const userId = req.user?.id;
    const roleId = req.user?.roleId;
    return this.commissionsService.getInboundCommissions(userId, roleId);
  }

  @Put(':id/receive')
  async markAsReceived(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: ReceiveCommissionDto,
  ) {
    return this.commissionsService.markAsReceived(
      id,
      req.user?.id || 'SYSTEM',
      body,
    );
  }
}
