export class CreateTaskDto {
  coldCallTarget: number;
  assignToAll: boolean;
  userIds?: string[];
}

export class UpdateTaskDto {
  coldCallTarget?: number;
  userId?: string;
  backlogOverride?: number;
}

export class CreateAnnouncementDto {
  title: string;
  description: string;
}

export class UpdateAnnouncementDto {
  title?: string;
  description?: string;
}
