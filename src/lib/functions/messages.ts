import { API_URL } from "@/utils/env";
import { createServerFn } from "@tanstack/react-start";
import type { Message } from "../message-model";
import { useAppSession } from "@/utils/session";

export const getMessagesByThread = createServerFn()
  .validator((d: string) => d)
  .handler(async ({ data }): Promise<Message[]> => {
    try {
      const { data: { token } } = await useAppSession();
      const res = await fetch(`${API_URL}/threads/${data}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.statusText}`);
      }
      const messages = await res.json()
      return messages;
    } catch (e) {
      console.error("Error fetching messages:", e);
      return []
    }
  })
