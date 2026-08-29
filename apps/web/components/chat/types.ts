export type ChatRoom = {
  id: string;
  name: string;
  avatarUrl: string | null;
  unreadCount: number;
  lastMessage: { content: string; createdAt: string } | null;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: { name: string; code: string };
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; image: string | null };
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
};
