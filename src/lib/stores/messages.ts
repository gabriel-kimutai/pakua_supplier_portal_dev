import type { Message } from "../message-model";
import { create } from 'zustand'

interface ChatStore {
  messages: Array<Message>
  onlineUsers: Set<number>
  addMessage: (message: Message) => void
  setMessages: (messages: Array<Message>) => void
  addOnlineUser: (id: number) => void
  removeOnlineUser: (id: number) => void
}

export const useChatstore = create<ChatStore>((set) => ({
  messages: new Array<Message>,
  onlineUsers: new Set<number>,
  addMessage: (message: Message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setMessages: (messages: Array<Message>) => set(() => ({
    messages: messages
  })),
  addOnlineUser: (id: number) => set((state) => {

    console.log("added user: ", id)
    return { onlineUsers: state.onlineUsers.add(id) }
  }),
  removeOnlineUser: (id: number) => set((state) => {
    console.log("removed user: ", id)
    const updatedSet = new Set<number>(state.onlineUsers)
    updatedSet.delete(id)
    return { onlineUsers: updatedSet }
  })
}))
