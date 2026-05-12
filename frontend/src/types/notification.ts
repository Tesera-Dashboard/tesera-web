export interface Notification {
  id: string;
  company_id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  priority: string;
  meta_data: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type: string;
  priority?: string;
  meta_data?: Record<string, any>;
}
