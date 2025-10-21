export interface Thread {
  thread_id: number;
  listing_id: string;
  listing_title: string;
  last_message: string;
  last_message_status: string;
  message_timestamp: string;
  sender_id: number;
  receiver_id: number;
  correspondent_id: number;
  correspondent_name: string;
  correspondent_avatar: string;
}
