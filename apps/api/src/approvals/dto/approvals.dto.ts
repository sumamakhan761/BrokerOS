import { ApprovalType } from '../../generated/prisma/client.js';

export class CreateApprovalRequestDto {
  title: string;
  description: string;
  fileUrl?: string;
  type?: ApprovalType;
  bookingId?: string;
}

export class AddApprovalMessageDto {
  title: string;
  description: string;
  fileUrl?: string;
  action?: 'APPROVE' | 'REJECT' | 'REPLY';
}
