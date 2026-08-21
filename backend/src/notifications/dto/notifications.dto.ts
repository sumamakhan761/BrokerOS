export class CreateNotificationDto {
  userId: string;
  type: any;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  metadata?: any;
  categoryId?: string;
  skipWebSocket?: boolean;
}

export class SendNotificationDto {
  id?: string;
  userId: string;
  type: any;
  title: string;
  body?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  actionUrl?: string | null;
  metadata?: any;
  isRead?: boolean;
  createdAt?: Date;
  readAt?: Date | null;
}
