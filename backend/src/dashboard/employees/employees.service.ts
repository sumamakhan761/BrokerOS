import { Injectable } from '@nestjs/common';
import { EmployeeCardsService } from './employee-cards.service.js';
import { ManagerTasksService } from '../manager/manager-tasks.service.js';
import { ManagerAnnouncementsService } from '../manager/manager-announcements.service.js';
import { CreateTaskDto, UpdateTaskDto, CreateAnnouncementDto, UpdateAnnouncementDto } from '../core/dto/dashboard.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    private employeeCards: EmployeeCardsService,
    private managerTasks: ManagerTasksService,
    private managerAnnouncements: ManagerAnnouncementsService,
  ) { }

  // ─── Employee Cards ────────────────────────────────────────────────────────

  async getEmployeeCards(managerId: string) {
    return this.employeeCards.getEmployeeCards(managerId);
  }

  async getEmployeeDashboardData(managerId: string, employeeId: string) {
    return this.employeeCards.getEmployeeDashboardData(managerId, employeeId);
  }

  async getSalesManagerEmployeeCards(managerId: string) {
    return this.employeeCards.getSalesManagerEmployeeCards(managerId);
  }

  async getSalesEmployeeDashboardData(managerId: string, employeeId: string) {
    return this.employeeCards.getSalesEmployeeDashboardData(managerId, employeeId);
  }

  async getPostSalesManagerEmployeeCards(managerId: string) {
    return this.employeeCards.getPostSalesManagerEmployeeCards(managerId);
  }

  async getPostSalesEmployeeDashboardData(managerId: string, employeeId: string) {
    return this.employeeCards.getPostSalesEmployeeDashboardData(managerId, employeeId);
  }

  async getCPSourcingManagerCards(managerId: string) {
    return this.employeeCards.getCPSourcingManagerCards(managerId);
  }

  async getCPClosingManagerCards(managerId: string) {
    return this.employeeCards.getCPClosingManagerCards(managerId);
  }

  // ─── Manager Tasks ─────────────────────────────────────────────────────────

  async createTask(managerId: string, data: CreateTaskDto) {
    return this.managerTasks.createTask(managerId, data);
  }

  async updateTask(
    taskId: string,
    managerId: string,
    data: UpdateTaskDto,
  ) {
    return this.managerTasks.updateTask(taskId, managerId, data);
  }

  async deleteTask(taskId: string, managerId: string) {
    return this.managerTasks.deleteTask(taskId, managerId);
  }

  async getActiveTasks(managerId: string) {
    return this.managerTasks.getActiveTasks(managerId);
  }

  async getMyTask(userId: string) {
    return this.managerTasks.getMyTask(userId);
  }

  // ─── Announcements ─────────────────────────────────────────────────────────

  async createAnnouncement(managerId: string, data: CreateAnnouncementDto) {
    return this.managerAnnouncements.createAnnouncement(managerId, data);
  }

  async updateAnnouncement(id: string, managerId: string, data: UpdateAnnouncementDto) {
    return this.managerAnnouncements.updateAnnouncement(id, managerId, data);
  }

  async deleteAnnouncement(id: string, managerId: string) {
    return this.managerAnnouncements.deleteAnnouncement(id, managerId);
  }

  async getManagerAnnouncements(managerId: string) {
    return this.managerAnnouncements.getManagerAnnouncements(managerId);
  }

  async getMyAnnouncements(userId: string) {
    return this.managerAnnouncements.getMyAnnouncements(userId);
  }
}
