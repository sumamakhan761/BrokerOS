import { Injectable } from '@nestjs/common';
import { PreSalesLeaderboardService } from '../pre-sales/pre-sales-leaderboard.service.js';
import { SalesExecLeaderboardService } from '../sales-exec/sales-exec-leaderboard.service.js';

@Injectable()
export class LeaderboardService {
  constructor(
    private preSalesLeaderboard: PreSalesLeaderboardService,
    private salesExecLeaderboard: SalesExecLeaderboardService,
  ) {}

  /** Monthly leaderboard for the whole pre-sales department */
  async getLeaderboard(userId: string) {
    return this.preSalesLeaderboard.getPreSalesLeaderboard(userId);
  }

  /** Monthly leaderboard scoped to a manager's subordinates */
  async getManagerLeaderboard(managerId: string) {
    return this.preSalesLeaderboard.getPreSalesManagerLeaderboard(managerId);
  }

  /** Monthly leaderboard for the whole sales executive department */
  async getSalesExecLeaderboard(userId: string) {
    return this.salesExecLeaderboard.getSalesExecLeaderboard(userId);
  }
}
