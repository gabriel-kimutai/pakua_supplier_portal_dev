import { WS_URL } from "@/utils/env";
import { type Message } from "./message-model";
import { getSession } from "./functions/session";
import { useChatstore } from "./stores/messages";


export type Status = "online" | "offline";
export type ControlMessage = "disconnect";

type MessageType = Message | number

interface WebSocketMessageEvent {
  data: string;
  type: string;
}

export type MessageHandler<T = MessageType> = (message: T) => void;

export class ChatSocket {
  private static instance: ChatSocket | null = null;
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 6;
  private token: string = "";
  private readonly reconnectDelayMs: number = 1000;
  // private readonly pingIntervalMs: number = 3000;
  private initializing: boolean = false;
  private messageHandlers: Set<MessageHandler> = new Set();

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): ChatSocket {
    if (!ChatSocket.instance) {
      ChatSocket.instance = new ChatSocket();
    }
    return ChatSocket.instance;
  }

  public async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    if (this.initializing) {
      console.log("WebSocket connection already in progress");
      return;
    }

    this.initializing = true;

    try {
      await this.setToken();
      const url = new URL(`${WS_URL}/ws`);
      url.searchParams.append("token", this.token);

      this.ws = new WebSocket(url.toString());

      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize ChatSocket:", error);
      this.initializing = false;
      throw error;
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);
  }

  private handleOpen() {
    console.log("ChatSocket connected");
    this.initializing = false;
    this.reconnectAttempts = 0;
    this.sendPresence("online");
  }

  public onMessage<T extends MessageType = MessageType>(handler: MessageHandler<T>) {
    console.info("NEW HANDLER")
    this.messageHandlers.add(handler as MessageHandler);
    return () => {
      this.messageHandlers.delete(handler as MessageHandler);
      console.info("HANDLER REMOVED")
    };
  }

  private handleMessage(event: WebSocketMessageEvent) {
    try {
      console.info("↓ Message received:", event.data);
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "presence:online":
          this.handlePresenceOnline(msg.data);
          break;
        case "presence:offline":
          this.handlePresenceOffline(msg.data);
          break;
        case "chat":
          this.handleChatMessage(msg.data);
          break;
        case "typing":
          this.handleTypingStatus(msg.data);
          break;
        default:
          console.warn("Unknown message type:", msg.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  private handleError(event: Event) {
    console.error("WebSocket error:", event);
    this.initializing = false;
  }

  private handleClose(event: WebSocketCloseEvent) {
    console.log("ChatSocket closed:", event);
    this.stopPing();
    this.initializing = false;

    const closeCodes = [1000, 1001]

    if (!closeCodes.includes(event.code!)) {
      this.tryReconnect();
    }
  }

  // Message handlers
  private handlePresenceOnline(data: number) {
    // this.messageHandlers.forEach(handler => {
    //   try {
    //     handler(data);
    //   } catch (error) {
    //     console.error("Error in message handler:", error);
    //   }
    // });
    useChatstore.getState().addOnlineUser(data)
    console.log("Presence message received:", data);
  }

  private handlePresenceOffline(data: any) {
    // this.messageHandlers.forEach(handler => {
    //   try {
    //     handler(data);
    //   } catch (error) {
    //     console.error("Error in message handler:", error);
    //   }
    // });
    useChatstore.getState().removeOnlineUser(data)
    console.log("User went offline:", data);
  }

  private handleChatMessage(message: Message) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    });
    console.log("Chat message received:", message);
  }

  private handleTypingStatus(isTyping: boolean) {
    console.log("Typing status received:", isTyping);
  }

  // Public methods
  public close(code?: number, reason?: string) {
    if (!this.ws) return;

    this.sendPresence("offline");
    this.ws.close(code, reason);
    //this.sendControl("disconnect");
    this.ws = null;
  }

  public sendMessage(message: Message) {
    this.sendPayload("chat", message);
  }

  public sendTypingStatus(isTyping: boolean) {
    this.sendPayload("typing", isTyping);
  }

  // Private methods
  private sendPresence(status: Status) {
    this.sendPayload("presence", status);
  }

  // private sendControl(msg: ControlMessage) {
  //   this.sendPayload("control", msg);
  // }

  private sendPayload(type: string, data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error(`Cannot send ${type}, WebSocket is not open.`);
      return;
    }

    try {
      const payload = JSON.stringify({ type, data });
      this.ws.send(payload);

      console.log(`↑ ${type} sent:`, payload);
    } catch (error) {
      console.error(`Error sending ${type}:`, error);
    }
  }

  private async setToken() {
    const data = await getSession()
    if (!data?.token) {
      throw new Error("No token found in session")
    }
    this.token = data.token;
  }

  // private startPing() {
  //   if (this.pingInterval === null) {
  //     this.pingInterval = setInterval(() => {
  //       if (this.ws?.readyState === WebSocket.OPEN) {
  //         this.sendPresence("online");
  //       } else {
  //         console.warn("WebSocket is not open, stopping ping.");
  //         this.stopPing();
  //       }
  //     }, this.pingIntervalMs);
  //   }
  // }

  private stopPing() {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private async tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached. Giving up.");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectAttempts * this.reconnectDelayMs;

    console.log(`Reconnecting... Attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts} in ${delay}ms`);

    await new Promise(resolve => setTimeout(resolve, delay));
    await this.connect();
  }
}

// Export a singleton instance
export const socket = ChatSocket.getInstance();
export default socket;
