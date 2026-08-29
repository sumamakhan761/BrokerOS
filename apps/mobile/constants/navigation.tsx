import React from 'react';
import {
  LayoutDashboard,
  ListFilter,
  Users,
  User,
  Sparkles,
  BarChart2,
  PieChart,
  Settings,
  CheckCircle2,
  Calendar,
  Building2,
  Briefcase,
  CreditCard,
  ClipboardCheck,
  IndianRupee,
  ShieldCheck,
  Search,
  Network,
  MoreHorizontal,
  Bell,
  MessageSquare,
} from 'lucide-react-native';

export type ScreenDefinition = {
  name: string;
  title: string;
  icon: string;
  roles: string[];
};

export type NavLinkItem = {
  name: string;
  title: string;
  icon: string;
};

export function renderTabIcon(iconName: string, color: string, size: number = 20) {
  switch (iconName) {
    case 'layout':
      return <LayoutDashboard size={size} color={color} strokeWidth={2} />;
    case 'list':
      return <ListFilter size={size} color={color} strokeWidth={2} />;
    case 'users':
      return <Users size={size} color={color} strokeWidth={2} />;
    case 'user':
      return <User size={size} color={color} strokeWidth={2} />;
    case 'star':
      return <Sparkles size={size} color={color} strokeWidth={2} />;
    case 'bar-chart-2':
      return <BarChart2 size={size} color={color} strokeWidth={2} />;
    case 'pie-chart':
      return <PieChart size={size} color={color} strokeWidth={2} />;
    case 'settings':
      return <Settings size={size} color={color} strokeWidth={2} />;
    case 'check-circle':
      return <CheckCircle2 size={size} color={color} strokeWidth={2} />;
    case 'calendar':
      return <Calendar size={size} color={color} strokeWidth={2} />;
    case 'package':
      return <Building2 size={size} color={color} strokeWidth={2} />;
    case 'briefcase':
      return <Briefcase size={size} color={color} strokeWidth={2} />;
    case 'credit-card':
      return <CreditCard size={size} color={color} strokeWidth={2} />;
    case 'clipboard':
      return <ClipboardCheck size={size} color={color} strokeWidth={2} />;
    case 'dollar-sign':
      return <IndianRupee size={size} color={color} strokeWidth={2} />;
    case 'shield':
      return <ShieldCheck size={size} color={color} strokeWidth={2} />;
    case 'search':
      return <Search size={size} color={color} strokeWidth={2} />;
    case 'link':
      return <Network size={size} color={color} strokeWidth={2} />;
    case 'menu':
      return <MoreHorizontal size={size} color={color} strokeWidth={2} />;
    case 'bell':
      return <Bell size={size} color={color} strokeWidth={2} />;
    case 'message-circle':
      return <MessageSquare size={size} color={color} strokeWidth={2} />;
    default:
      return <LayoutDashboard size={size} color={color} strokeWidth={2} />;
  }
}

export const ALL_POSSIBLE_SCREENS: ScreenDefinition[] = [
  { name: 'pre-sales/index', title: 'Overview', icon: 'layout', roles: ['PRE_SALES'] },
  { name: 'pre-sales/lead-management', title: 'Leads', icon: 'list', roles: ['PRE_SALES'] },
  { name: 'pre-sales/analytics', title: 'Analytics', icon: 'bar-chart-2', roles: ['PRE_SALES'] },
  { name: 'pre-sales/settings', title: 'Settings', icon: 'settings', roles: ['PRE_SALES'] },
  { name: 'pre-sales-manager/index', title: 'Overview', icon: 'layout', roles: ['PRE_SALES_MANAGER'] },
  { name: 'pre-sales-manager/lead-management', title: 'Leads', icon: 'list', roles: ['PRE_SALES_MANAGER'] },
  { name: 'pre-sales-manager/employees', title: 'Employees', icon: 'users', roles: ['PRE_SALES_MANAGER'] },
  { name: 'pre-sales-manager/employees/[employeeId]', title: 'Employee Details', icon: 'user', roles: ['PRE_SALES_MANAGER'] },
  { name: 'pre-sales-manager/new-leads', title: 'New Leads', icon: 'star', roles: ['PRE_SALES_MANAGER'] },
  { name: 'pre-sales-manager/analytics', title: 'Analytics', icon: 'bar-chart-2', roles: ['PRE_SALES_MANAGER'] },
  { name: 'pre-sales-manager/settings', title: 'Settings', icon: 'settings', roles: ['PRE_SALES_MANAGER'] },
  { name: 'sales-executive/index', title: 'Dashboard', icon: 'layout', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/lead-management', title: 'Leads', icon: 'list', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/lead-management/[id]', title: 'Lead Profile', icon: 'user', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/approval/index', title: 'Approval', icon: 'check-circle', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/booking/index', title: 'Booking', icon: 'calendar', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/more/index', title: 'More', icon: 'menu', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/inventory/index', title: 'Inventory', icon: 'package', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-executive/settings/index', title: 'Settings', icon: 'settings', roles: ['SALES_EXECUTIVE'] },
  { name: 'sales-manager/index', title: 'Overview', icon: 'layout', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/employees/index', title: 'Employees', icon: 'users', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/employees/[employeeId]', title: 'Employee Details', icon: 'user', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/lead-management/index', title: 'Leads', icon: 'list', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/approval/index', title: 'Approval', icon: 'check-circle', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/more/index', title: 'More', icon: 'menu', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/inventory/index', title: 'Inventory', icon: 'package', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/booking/index', title: 'Booking', icon: 'calendar', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['SALES_MANAGER'] },
  { name: 'sales-manager/settings/index', title: 'Settings', icon: 'settings', roles: ['SALES_MANAGER'] },
  { name: 'sales/index', title: 'Sales', icon: 'briefcase', roles: ['SALES_EXECUTIVE'] },
  { name: 'post-sales/index', title: 'Overview', icon: 'layout', roles: ['POST_SALES'] },
  { name: 'post-sales/lead-management', title: 'Leads', icon: 'list', roles: ['POST_SALES'] },
  { name: 'post-sales/inventory/index', title: 'Inventory', icon: 'package', roles: ['POST_SALES'] },
  { name: 'post-sales/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['POST_SALES'] },
  { name: 'post-sales/commissions/index', title: 'Commissions', icon: 'credit-card', roles: ['POST_SALES'] },
  { name: 'post-sales/more/index', title: 'More', icon: 'menu', roles: ['POST_SALES'] },
  { name: 'post-sales/handover', title: 'Handover', icon: 'clipboard', roles: ['POST_SALES'] },
  { name: 'post-sales/analytics', title: 'Analytics', icon: 'pie-chart', roles: ['POST_SALES'] },
  { name: 'post-sales/settings', title: 'Settings', icon: 'settings', roles: ['POST_SALES'] },
  { name: 'post-sales-manager/index', title: 'Overview', icon: 'layout', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/employees/index', title: 'Employees', icon: 'users', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/employees/[employeeId]', title: 'Employee Details', icon: 'user', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/lead-management', title: 'Leads', icon: 'list', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/inventory/index', title: 'Inventory', icon: 'package', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/commissions/index', title: 'Commissions', icon: 'credit-card', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/more/index', title: 'More', icon: 'menu', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/handover', title: 'Handover', icon: 'clipboard', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/analytics', title: 'Analytics', icon: 'pie-chart', roles: ['POST_SALES_MANAGER'] },
  { name: 'post-sales-manager/settings', title: 'Settings', icon: 'settings', roles: ['POST_SALES_MANAGER'] },
  { name: 'finance/index', title: 'Finance', icon: 'dollar-sign', roles: ['FINANCE'] },
  { name: 'business-manager/index', title: 'Business Mgr', icon: 'bar-chart-2', roles: ['BUSINESS_MANAGER'] },
  { name: 'director/index', title: 'Director', icon: 'shield', roles: ['DIRECTOR'] },
  { name: 'admin/index', title: 'Admin', icon: 'settings', roles: ['ADMIN'] },
  { name: 'sourcing-manager/index', title: 'Overview', icon: 'layout', roles: ['SOURCING_MANAGER'] },
  { name: 'sourcing-manager/broker-management/index', title: 'Brokers', icon: 'users', roles: ['SOURCING_MANAGER'] },
  { name: 'sourcing-manager/commissions/index', title: 'Commissions', icon: 'dollar-sign', roles: ['SOURCING_MANAGER'] },
  { name: 'sourcing-manager/inventory/index', title: 'Inventory', icon: 'package', roles: ['SOURCING_MANAGER'] },
  { name: 'sourcing-manager/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['SOURCING_MANAGER'] },
  { name: 'sourcing-manager/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['SOURCING_MANAGER'] },
  { name: 'sourcing-manager/settings/index', title: 'Settings', icon: 'settings', roles: ['SOURCING_MANAGER'] },
  { name: 'closing-manager/index', title: 'Overview', icon: 'layout', roles: ['CLOSING_MANAGER'] },
  { name: 'closing-manager/inventory/index', title: 'Inventory', icon: 'package', roles: ['CLOSING_MANAGER'] },
  { name: 'closing-manager/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['CLOSING_MANAGER'] },
  { name: 'closing-manager/lead-management/index', title: 'Leads', icon: 'list', roles: ['CLOSING_MANAGER'] },
  { name: 'closing-manager/more/index', title: 'More', icon: 'menu', roles: ['CLOSING_MANAGER'] },
  { name: 'closing-manager/broker-management/index', title: 'Brokers', icon: 'users', roles: ['CLOSING_MANAGER'] },
  { name: 'closing-manager/handover/index', title: 'Handover', icon: 'clipboard', roles: ['CLOSING_MANAGER'] },
  { name: 'closing-manager/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['CLOSING_MANAGER'] },
  { name: 'closing-manager/settings/index', title: 'Settings', icon: 'settings', roles: ['CLOSING_MANAGER'] },
  { name: 'channel-partner/index', title: 'Overview', icon: 'layout', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/customer-management/index', title: 'Customers', icon: 'users', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/employees/index', title: 'Employees', icon: 'users', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/employees/[employeeId]', title: 'Employee Details', icon: 'user', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/more/index', title: 'More', icon: 'menu', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/inventory/index', title: 'Inventory', icon: 'package', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/broker-management/index', title: 'Brokers', icon: 'users', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['CHANNEL_PARTNER'] },
  { name: 'channel-partner/settings/index', title: 'Settings', icon: 'settings', roles: ['CHANNEL_PARTNER'] },
  { name: 'index', title: 'Dashboard', icon: 'layout', roles: [] },
  { name: 'notifications', title: 'Notifications', icon: 'bell', roles: [] },
  { name: 'chat/index', title: 'Messages', icon: 'message-circle', roles: [] },
  { name: 'chat/[id]', title: 'Chat Room', icon: 'message-circle', roles: [] },
];

export function getNavLinksForRole(userRole: string): NavLinkItem[] {
  switch (userRole) {
    case 'PRE_SALES':
      return [
        { name: 'pre-sales/index', title: 'Dashboard', icon: 'layout' },
        { name: 'pre-sales/lead-management', title: 'Leads', icon: 'list' },
        { name: 'pre-sales/analytics', title: 'Analytics', icon: 'bar-chart-2' },
        { name: 'pre-sales/settings', title: 'Settings', icon: 'settings' },
      ];
    case 'PRE_SALES_MANAGER':
      return [
        { name: 'pre-sales-manager/index', title: 'Overview', icon: 'layout' },
        { name: 'pre-sales-manager/lead-management', title: 'Leads', icon: 'list' },
        { name: 'pre-sales-manager/employees', title: 'Employees', icon: 'users' },
        { name: 'pre-sales-manager/new-leads', title: 'New Leads', icon: 'star' },
        { name: 'pre-sales-manager/analytics', title: 'Analytics', icon: 'bar-chart-2' },
        { name: 'pre-sales-manager/settings', title: 'Settings', icon: 'settings' },
      ];
    case 'SALES_EXECUTIVE':
      return [
        { name: 'sales-executive/index', title: 'Dashboard', icon: 'layout' },
        { name: 'sales-executive/lead-management', title: 'Leads', icon: 'list' },
        { name: 'sales-executive/approval/index', title: 'Approval', icon: 'check-circle' },
        { name: 'sales-executive/booking/index', title: 'Booking', icon: 'calendar' },
        { name: 'sales-executive/more/index', title: 'More', icon: 'menu' },
      ];
    case 'SALES_MANAGER':
      return [
        { name: 'sales-manager/index', title: 'Dashboard', icon: 'layout' },
        { name: 'sales-manager/employees/index', title: 'Employees', icon: 'users' },
        { name: 'sales-manager/lead-management/index', title: 'Leads', icon: 'list' },
        { name: 'sales-manager/approval/index', title: 'Approval', icon: 'check-circle' },
        { name: 'sales-manager/more/index', title: 'More', icon: 'menu' },
      ];
    case 'POST_SALES':
      return [
        { name: 'post-sales/index', title: 'Overview', icon: 'layout' },
        { name: 'post-sales/lead-management', title: 'Leads', icon: 'list' },
        { name: 'post-sales/inventory/index', title: 'Inventory', icon: 'package' },
        { name: 'post-sales/commissions/index', title: 'Commissions', icon: 'credit-card' },
        { name: 'post-sales/more/index', title: 'More', icon: 'menu' },
      ];
    case 'POST_SALES_MANAGER':
      return [
        { name: 'post-sales-manager/index', title: 'Overview', icon: 'layout' },
        { name: 'post-sales-manager/employees/index', title: 'Employees', icon: 'users' },
        { name: 'post-sales-manager/lead-management', title: 'Leads', icon: 'list' },
        { name: 'post-sales-manager/inventory/index', title: 'Inventory', icon: 'package' },
        { name: 'post-sales-manager/more/index', title: 'More', icon: 'menu' },
      ];
    case 'SOURCING_MANAGER':
      return [
        { name: 'sourcing-manager/index', title: 'Overview', icon: 'layout' },
        { name: 'sourcing-manager/broker-management/index', title: 'Brokers', icon: 'users' },
        { name: 'sourcing-manager/commissions/index', title: 'Commissions', icon: 'dollar-sign' },
        { name: 'sourcing-manager/inventory/index', title: 'Inventory', icon: 'package' },
        { name: 'sourcing-manager/analytics/index', title: 'Analytics', icon: 'pie-chart' },
        { name: 'sourcing-manager/settings/index', title: 'Settings', icon: 'settings' },
      ];
    case 'CLOSING_MANAGER':
      return [
        { name: 'closing-manager/index', title: 'Overview', icon: 'layout' },
        { name: 'closing-manager/inventory/index', title: 'Inventory', icon: 'package' },
        { name: 'closing-manager/lead-management/index', title: 'Leads', icon: 'list' },
        { name: 'closing-manager/more/index', title: 'More', icon: 'menu' },
      ];
    case 'CHANNEL_PARTNER':
      return [
        { name: 'channel-partner/index', title: 'Overview', icon: 'layout' },
        { name: 'channel-partner/customer-management/index', title: 'Customers', icon: 'users' },
        { name: 'channel-partner/employees/index', title: 'Employees', icon: 'users' },
        { name: 'channel-partner/more/index', title: 'More', icon: 'menu' },
      ];
    default:
      return [];
  }
}
