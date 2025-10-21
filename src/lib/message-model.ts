export interface Message {
  id?: number;
  thread_id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  status: "pending" | "sent" | "read";
  created_at?: string;
}
