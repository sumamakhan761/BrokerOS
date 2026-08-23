import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { prismaClient as prisma } from '../lib/database/prisma-client.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationType } from '@brokeros/prisma';

@Injectable()
export class NotificationsCron {
  private readonly logger = new Logger(NotificationsCron.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) { }

  /**
   * Daily at 10:35 PM (for testing)
   * Process missed follow-ups from yesterday.
   */
  @Cron('56 22 * * *')
  async handleMissedFollowUps() {
    this.logger.log('Running daily missed follow-up cron job...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // start of today

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Fix UTC offset issue by formatting in local time
      const yyyy = yesterday.getFullYear();
      const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
      const dd = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayFormatted = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD

      // Find all follow-ups that were scheduled yesterday and are still SCHEDULED
      const missedFollowUps = await prisma.followUp.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledDate: {
            gte: yesterday,
            lt: today,
          },
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
        },
      });

      if (missedFollowUps.length === 0) {
        this.logger.log('No missed follow-ups found for yesterday.');
        return;
      }

      // 1. Group by employee to send Notification #3
      const employeeMissedMap = new Map<string, { count: number, roleCode: string, managerId: string | null }>();

      for (const fu of missedFollowUps) {
        if (!employeeMissedMap.has(fu.userId)) {
          employeeMissedMap.set(fu.userId, {
            count: 0,
            roleCode: fu.user.role?.code || '',
            managerId: fu.user.managerId
          });
        }
        employeeMissedMap.get(fu.userId)!.count += 1;
      }

      // Send Employee Notifications
      for (const [userId, data] of employeeMissedMap.entries()) {
        let actionUrl = '';

        // Define deep link based on role
        if (data.roleCode === 'PRE_SALES') {
          actionUrl = `/dashboard/pre-sales/lead-management?followUpDate=${yesterdayFormatted}`;
        } else if (data.roleCode === 'SALES_EXECUTIVE') {
          actionUrl = `/dashboard/sales-executive/lead-management?followUpDate=${yesterdayFormatted}`;
        } else if (data.roleCode === 'POST_SALES') {
          actionUrl = `/dashboard/post-sales/lead-management?followUpDate=${yesterdayFormatted}`;
        } else if (data.roleCode === 'SOURCING_MANAGER') {
          actionUrl = `/dashboard/sourcing-manager/broker-management?followUpDate=${yesterdayFormatted}`;
        } else if (data.roleCode === 'CLOSING_MANAGER') {
          actionUrl = `/dashboard/closing-manager/lead-management?followUpDate=${yesterdayFormatted}`;
        } else {
          // fallback for managers that also do their own follow ups
          const roleSlug = data.roleCode.toLowerCase().replace('_', '-');
          actionUrl = `/${roleSlug}/lead-management?followUpDate=${yesterdayFormatted}`;
        }

        await this.notificationsService.createNotification({
          userId: userId,
          type: NotificationType.MISSED_FOLLOW_UP,
          title: `You missed ${data.count} follow-up${data.count > 1 ? 's' : ''} yesterday.`,
          body: 'Please complete them. They are now in your backlog.',
          actionUrl,
          metadata: { count: data.count, date: yesterdayFormatted },
        });
      }

      // 2. Group by Manager to send Notification #4
      // We will group by managerId + department (based on subordinate's role)
      const managerAlertMap = new Map<string, {
        preSalesCount: number,
        salesExecCount: number,
        sourcingCount: number,
        closingCount: number
      }>();

      for (const [userId, data] of employeeMissedMap.entries()) {
        if (data.managerId) {
          if (!managerAlertMap.has(data.managerId)) {
            managerAlertMap.set(data.managerId, {
              preSalesCount: 0,
              salesExecCount: 0,
              sourcingCount: 0,
              closingCount: 0
            });
          }
          const managerData = managerAlertMap.get(data.managerId)!;

          if (data.roleCode === 'PRE_SALES') managerData.preSalesCount += data.count;
          else if (data.roleCode === 'SALES_EXECUTIVE') managerData.salesExecCount += data.count;
          else if (data.roleCode === 'SOURCING_MANAGER') managerData.sourcingCount += data.count;
          else if (data.roleCode === 'CLOSING_MANAGER') managerData.closingCount += data.count;
        }
      }

      // Send Manager Notifications
      for (const [managerId, counts] of managerAlertMap.entries()) {
        const manager = await prisma.user.findUnique({ where: { id: managerId }, include: { role: true } });
        if (!manager || !manager.role) continue;

        const roleCode = manager.role.code;

        if (roleCode === 'PRE_SALES_MANAGER' && counts.preSalesCount > 0) {
          await this.notificationsService.createNotification({
            userId: managerId,
            type: NotificationType.MANAGER_TEAM_ALERT,
            title: `Your team missed ${counts.preSalesCount} follow-ups yesterday.`,
            body: `Pre-Sales team: ${counts.preSalesCount} missed follow-ups from yesterday.`,
            actionUrl: `/dashboard/pre-sales-manager/lead-management?followUpDate=${yesterdayFormatted}`,
            metadata: { count: counts.preSalesCount, department: 'PRE_SALES', date: yesterdayFormatted },
          });
        }

        if (roleCode === 'SALES_MANAGER' && counts.salesExecCount > 0) {
          await this.notificationsService.createNotification({
            userId: managerId,
            type: NotificationType.MANAGER_TEAM_ALERT,
            title: `Your team missed ${counts.salesExecCount} follow-ups yesterday.`,
            body: `Sales Executive team: ${counts.salesExecCount} missed follow-ups from yesterday.`,
            actionUrl: `/dashboard/sales-manager/lead-management?followUpDate=${yesterdayFormatted}`,
            metadata: { count: counts.salesExecCount, department: 'SALES_EXECUTIVE', date: yesterdayFormatted },
          });
        }

        if (roleCode === 'CHANNEL_PARTNER') {
          if (counts.sourcingCount > 0) {
            await this.notificationsService.createNotification({
              userId: managerId,
              type: NotificationType.MANAGER_TEAM_ALERT,
              title: `Your Sourcing team missed ${counts.sourcingCount} follow-ups yesterday.`,
              body: `Sourcing team missed ${counts.sourcingCount} follow-ups from yesterday.`,
              actionUrl: `/dashboard/channel-partner/broker-management?followUpDate=${yesterdayFormatted}`,
              metadata: { count: counts.sourcingCount, department: 'SOURCING_MANAGER', date: yesterdayFormatted },
            });
          }
          if (counts.closingCount > 0) {
            await this.notificationsService.createNotification({
              userId: managerId,
              type: NotificationType.MANAGER_TEAM_ALERT,
              title: `Your Closing team missed ${counts.closingCount} follow-ups yesterday.`,
              body: `Closing team missed ${counts.closingCount} follow-ups from yesterday.`,
              actionUrl: `/channel-partner/customer-management?followUpDate=${yesterdayFormatted}`,
              metadata: { count: counts.closingCount, department: 'CLOSING_MANAGER', date: yesterdayFormatted },
            });
          }
        }
      }

      this.logger.log(`Missed follow-up cron job completed successfully. Processed ${missedFollowUps.length} missed follow-ups.`);
    } catch (error) {
      this.logger.error('Failed to run missed follow-up cron job', error);
    }
  }

  /**
   * Daily at 8:00 AM
   * Notification #5: One Day Before Site Visit Reminder
   */
  @Cron('08 01 * * *')
  async handleTomorrowSiteVisits() {
    this.logger.log('Running tomorrow site visit reminder cron job...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      const tomorrowFormatted = `${yyyy}-${mm}-${dd}`;

      const upcomingVisits = await prisma.siteVisit.findMany({
        where: {
          status: { in: ['ASSIGNED', 'SCHEDULED', 'CONFIRMED'] },
          scheduledDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          }
        },
        include: { lead: true }
      });

      if (upcomingVisits.length === 0) {
        this.logger.log('No site visits scheduled for tomorrow.');
        return;
      }

      const execMap = new Map<string, { id: string, customerName: string, time: string }[]>();

      for (const sv of upcomingVisits) {
        const customerName = sv.lead.lastName ? `${sv.lead.firstName} ${sv.lead.lastName}` : sv.lead.firstName;
        const time = new Date(sv.scheduledDate).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

        if (!execMap.has(sv.salesExecId)) {
          execMap.set(sv.salesExecId, []);
        }
        execMap.get(sv.salesExecId)!.push({ id: sv.id, customerName, time });
      }

      for (const [salesExecId, visits] of execMap.entries()) {
        const customerNames = visits.map(v => v.customerName).join(', ');
        const bodyText = customerNames.length > 50 ? customerNames.substring(0, 47) + '...' : customerNames;

        await this.notificationsService.createNotification({
          userId: salesExecId,
          type: NotificationType.SITE_VISIT_REMINDER,
          title: `You have ${visits.length} site visit${visits.length > 1 ? 's' : ''} tomorrow.`,
          body: bodyText,
          actionUrl: `/dashboard/sales-executive/lead-management?siteVisitDate=${tomorrowFormatted}`,
          metadata: {
            count: visits.length,
            siteVisits: visits,
            date: tomorrowFormatted
          }
        });
      }
      this.logger.log(`Sent tomorrow site visit reminders for ${upcomingVisits.length} visits to ${execMap.size} executives.`);
    } catch (e) {
      this.logger.error('Failed to run tomorrow site visit reminder cron', e);
    }
  }

  /**
   * Daily at Midnight
   * Notification #6: Exact-Time Site Visit "Arrive" Push scheduling
   */
  @Cron('25 01 * * *')
  async scheduleTodaySiteVisitArrivePush() {
    this.logger.log('Scheduling today\'s exact-time site visit Arrive pushes...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysVisits = await prisma.siteVisit.findMany({
        where: {
          status: { in: ['ASSIGNED', 'SCHEDULED', 'CONFIRMED'] },
          scheduledDate: {
            gte: today,
            lt: tomorrow,
          }
        },
        include: { lead: true, project: true }
      });

      let scheduledCount = 0;

      for (const sv of todaysVisits) {
        // Schedule 5 minutes before the actual site visit time
        const targetTime = sv.scheduledDate.getTime() - 5 * 60 * 1000;
        const now = Date.now();
        const delay = targetTime - now;

        if (delay > 0) {
          const timeoutName = `arrive_push_${sv.id}`;

          if (this.schedulerRegistry.doesExist('timeout', timeoutName)) {
            this.schedulerRegistry.deleteTimeout(timeoutName);
          }

          const timeout = setTimeout(async () => {
            try {
              const currentSv = await prisma.siteVisit.findUnique({ where: { id: sv.id }, include: { lead: true, project: true } });
              if (!currentSv) return;

              if (['ASSIGNED', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(currentSv.status) && !currentSv.arriveNotifSentAt) {
                const customerName = currentSv.lead.lastName ? `${currentSv.lead.firstName} ${currentSv.lead.lastName}` : currentSv.lead.firstName;

                await this.notificationsService.createNotification({
                  userId: currentSv.salesExecId,
                  type: NotificationType.SITE_VISIT_ARRIVE,
                  title: '🏠 Site Visit — Arrive',
                  body: `Your site visit for ${customerName} is starting soon.`,
                  categoryId: 'site_visit_arrive',
                  skipWebSocket: true, // Only mobile push, not in web app bell
                  metadata: {
                    siteVisitId: currentSv.id,
                    customerName: customerName,
                    projectName: currentSv.project.name,
                  }
                });

                await prisma.siteVisit.update({
                  where: { id: sv.id },
                  data: { arriveNotifSentAt: new Date() }
                });

                this.logger.log(`Sent exact-time arrive push for SV ${currentSv.id}`);
              }
            } catch (err) {
              this.logger.error(`Failed to execute arrive push for SV ${sv.id}`, err);
            }
          }, delay);

          this.schedulerRegistry.addTimeout(timeoutName, timeout);
          scheduledCount++;
        }
      }
      this.logger.log(`Scheduled ${scheduledCount} arrive pushes for today.`);
    } catch (e) {
      this.logger.error('Failed to schedule today\'s site visit pushes', e);
    }
  }

  /**
   * Monthly at 9:00 AM on the 1st
   * Notification #10: Monthly Analytics Report
   */
  @Cron('0 9 1 * *')
  async sendMonthlyAnalyticsReports() {
    this.logger.log('Running monthly analytics report cron job...');
    try {
      const today = new Date();
      today.setDate(0); // Last day of the previous month
      const monthName = today.toLocaleString('default', { month: 'long' });
      const year = today.getFullYear();

      const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, role: { select: { code: true } } }
      });

      let count = 0;

      for (const user of users) {
        const roleCode = (user as any).role?.code;
        if (!roleCode || roleCode === 'ADMIN' || roleCode === 'DIRECTOR') {
          continue; // These roles might not have traditional analytics pages
        }

        const roleRoute = roleCode.toLowerCase().replace(/_/g, '-');

        await this.notificationsService.createNotification({
          userId: user.id,
          type: NotificationType.MONTHLY_ANALYTICS,
          title: `Your ${monthName} performance report is ready.`,
          body: `Tap to view your detailed analytics report for ${monthName}.`,
          actionUrl: `/dashboard/${roleRoute}/analytics`,
          metadata: {
            month: monthName,
            year: year,
            role: roleCode,
            isManagerReport: roleCode.includes('MANAGER')
          }
        });
        count++;
      }

      this.logger.log(`Sent monthly analytics reports to ${count} users for ${monthName} ${year}.`);
    } catch (e) {
      this.logger.error('Failed to send monthly analytics reports', e);
    }
  }

  /**
   * Monthly at 9:00 AM on the 1st
   * Notification #21: Monthly Leaderboard (Rankings)
   */
  @Cron('42 23 9 * *')
  async sendMonthlyLeaderboards() {
    this.logger.log('Running monthly leaderboards cron job...');
    try {
      const today = new Date();
      // Calculate previous month's start and end
      const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

      const monthName = startOfMonth.toLocaleString('default', { month: 'long' });
      const year = startOfMonth.getFullYear();

      const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        include: { role: true }
      });

      const usersByRole: Record<string, typeof users> = {};
      for (const u of users) {
        if (u.role) {
          usersByRole[u.role.code] = usersByRole[u.role.code] || [];
          usersByRole[u.role.code].push(u);
        }
      }

      const sendLeaderboard = async (
        targetUsers: typeof users,
        metricName: string,
        roleCodeMap: Record<string, string>,
        getScore: (userId: string) => Promise<number>,
        managersToNotify: typeof users = [],
        boardName: string = ''
      ) => {
        if (targetUsers.length === 0) return;

        const scores: { userId: string, name: string, score: number }[] = [];
        for (const u of targetUsers) {
          const score = await getScore(u.id);
          scores.push({ userId: u.id, name: (u.name || '').trim(), score });
        }

        scores.sort((a, b) => b.score - a.score);

        const leaderboardMeta = scores.map((s, index) => ({
          rank: index + 1,
          name: s.name,
          score: s.score
        }));

        for (let i = 0; i < scores.length; i++) {
          const userObj = targetUsers.find(u => u.id === scores[i].userId);
          if (!userObj || !userObj.role) continue;

          const rank = i + 1;
          let title = '';
          if (rank === 1) title = `🥇 You ranked #1 this month! Congratulations!`;
          else if (rank === 2) title = `🥈 You ranked #2 this month. Great work!`;
          else if (rank === 3) title = `🥉 You ranked #3 this month. Well done!`;
          else title = `📊 You ranked #${rank} out of ${scores.length} this month.`;

          const actionUrl = roleCodeMap[userObj.role.code] || `/dashboard/${userObj.role.code.toLowerCase().replace('_', '-')}/analytics`;

          await this.notificationsService.createNotification({
            userId: scores[i].userId,
            type: NotificationType.MONTHLY_LEADERBOARD,
            title,
            body: `See your performance for ${monthName} ${year}.`,
            actionUrl,
            metadata: {
              month: monthName,
              year,
              rank,
              totalInTeam: scores.length,
              metric: metricName,
              score: scores[i].score
            }
          });
        }

        const top3Names = scores.slice(0, 3).map((s, idx) => `${idx + 1}. ${s.name}`).join(', ');
        const managerBody = top3Names ? `Top 3: ${top3Names}` : `See your team's performance rankings.`;

        for (const mgr of managersToNotify) {
          const actionUrl = roleCodeMap[mgr.role!.code] || `/dashboard/${mgr.role!.code.toLowerCase().replace('_', '-')}/analytics`;

          await this.notificationsService.createNotification({
            userId: mgr.id,
            type: NotificationType.MONTHLY_LEADERBOARD,
            title: `📊 ${boardName} Leaderboard for ${monthName} ${year}`,
            body: managerBody,
            actionUrl,
            metadata: {
              month: monthName,
              year,
              totalInTeam: scores.length,
              metric: metricName,
              leaderboard: leaderboardMeta
            }
          });
        }
      };

      // 1. PRE_SALES
      await sendLeaderboard(
        usersByRole['PRE_SALES'] || [],
        'follow-ups',
        { 'PRE_SALES': '/dashboard/pre-sales/analytics', 'PRE_SALES_MANAGER': '/dashboard/pre-sales-manager/analytics' },
        async (userId) => {
          return prisma.followUp.count({
            where: { userId, status: 'COMPLETED', updatedAt: { gte: startOfMonth, lte: endOfMonth } }
          });
        },
        usersByRole['PRE_SALES_MANAGER'] || [],
        'Pre-Sales'
      );

      // 2. SALES_EXECUTIVE
      await sendLeaderboard(
        usersByRole['SALES_EXECUTIVE'] || [],
        'bookings',
        { 'SALES_EXECUTIVE': '/dashboard/sales-executive/analytics', 'SALES_MANAGER': '/dashboard/sales-manager/analytics' },
        async (userId) => {
          return prisma.booking.count({
            where: { salesExecId: userId, createdAt: { gte: startOfMonth, lte: endOfMonth } }
          });
        },
        usersByRole['SALES_MANAGER'] || [],
        'Sales Executive'
      );

      // 3. POST_SALES
      await sendLeaderboard(
        usersByRole['POST_SALES'] || [],
        'handovers',
        { 'POST_SALES': '/dashboard/post-sales/analytics' },
        async (userId) => {
          return prisma.possessionHandover.count({
            where: { handoverById: userId, status: 'HANDED_OVER', updatedAt: { gte: startOfMonth, lte: endOfMonth } }
          });
        }
      );

      // 4. SOURCING_MANAGER
      await sendLeaderboard(
        usersByRole['SOURCING_MANAGER'] || [],
        'deals_sourced',
        { 'SOURCING_MANAGER': '/dashboard/sourcing-manager/analytics', 'CHANNEL_PARTNER': '/dashboard/channel-partner/analytics' },
        async (userId) => {
          return prisma.booking.count({
            where: {
              createdAt: { gte: startOfMonth, lte: endOfMonth },
              customer: { lead: { broker: { sourcingManagerId: userId } } }
            }
          });
        },
        usersByRole['CHANNEL_PARTNER'] || [],
        'Sourcing Manager'
      );

      // 5. CLOSING_MANAGER
      await sendLeaderboard(
        usersByRole['CLOSING_MANAGER'] || [],
        'cp_bookings',
        { 'CLOSING_MANAGER': '/dashboard/closing-manager/analytics', 'CHANNEL_PARTNER': '/dashboard/channel-partner/analytics' },
        async (userId) => {
          return prisma.booking.count({
            where: {
              createdAt: { gte: startOfMonth, lte: endOfMonth },
              unit: { floor: { tower: { project: { isCpProject: true } } } },
              OR: [
                { unit: { floor: { tower: { towerAssignments: { some: { userId, role: 'CLOSING_MANAGER' } } } } } },
                { unit: { floor: { tower: { project: { projectAssignments: { some: { userId, role: 'CLOSING_MANAGER' } } } } } } }
              ]
            }
          });
        },
        usersByRole['CHANNEL_PARTNER'] || [],
        'Closing Manager'
      );

      // 6. Sourcing Manager's Broker Leaderboard
      const sourcingManagers = usersByRole['SOURCING_MANAGER'] || [];
      for (const sm of sourcingManagers) {
        const smBrokers = await prisma.broker.findMany({
          where: { sourcingManagerId: sm.id, status: 'ACTIVE' }
        });

        if (smBrokers.length > 0) {
          const scores: { id: string, name: string, score: number }[] = [];
          for (const broker of smBrokers) {
            const bookings = await prisma.booking.count({
              where: {
                createdAt: { gte: startOfMonth, lte: endOfMonth },
                customer: { lead: { brokerId: broker.id } }
              }
            });
            scores.push({ id: broker.id, name: broker.name, score: bookings });
          }

          scores.sort((a, b) => b.score - a.score);
          const leaderboardMeta = scores.map((s, idx) => ({
            rank: idx + 1,
            name: s.name,
            score: s.score
          }));

          const top3Brokers = scores.slice(0, 3).map((s, idx) => `${idx + 1}. ${s.name}`).join(', ');
          const brokerManagerBody = top3Brokers ? `Top 3 Brokers: ${top3Brokers}` : `See how your active brokers ranked.`;

          await this.notificationsService.createNotification({
            userId: sm.id,
            type: NotificationType.MONTHLY_LEADERBOARD,
            title: `📊 Broker Leaderboard for ${monthName} ${year}`,
            body: brokerManagerBody,
            actionUrl: `/dashboard/sourcing-manager/analytics`,
            metadata: {
              month: monthName,
              year,
              totalInTeam: scores.length,
              metric: 'broker_bookings',
              leaderboard: leaderboardMeta
            }
          });
        }
      }

      this.logger.log(`Monthly leaderboards generated successfully.`);
    } catch (e) {
      this.logger.error('Failed to run monthly leaderboards cron', e);
    }
  }
}
