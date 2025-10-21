import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Check, CheckCheck, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Message } from "@/lib/message-model"


interface ChatMessagesProps {
  messages?: Message[]
  currentUserId?: number
  onSendMessage?: (content: string) => void
}

export default function ChatMessages({ messages = [], currentUserId = 1, onSendMessage }: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])


  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
  }

  const getStatusColor = (status: Message["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "sent":
        return "bg-gray-100 text-gray-800"
      case "read":
        return "bg-blue-100 text-blue-800"
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage?.(newMessage.trim())
      setNewMessage("")
    }
  }

  return (
    <div className="flex flex-col h-full w-full  border rounded-lg bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 h-[80dvh] max-h-[80dvh]">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] space-y-1`}>
                  <div
                    className={`rounded-lg px-3 py-2 ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs text-muted-foreground ${isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                  >
                    <span>{formatTime(message.created_at!)}</span>
                    {isCurrentUser && (
                      <>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(message.status)}`}>
                          {message.status}
                        </Badge>
                        {getStatusIcon(message.status)}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}


export function ChatMessagesSkeleton() {
  return (
    <div className="flex flex-col h-[600px] max-w-2xl border rounded-lg bg-background">
      {/* Header Skeleton */}
      <div className="p-4 border-b bg-muted/50">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {/* Message from other user (left aligned) */}
        <div className="flex justify-start">
          <div className="max-w-[70%] space-y-1">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* Message from current user (right aligned) */}
        <div className="flex justify-end">
          <div className="max-w-[70%] space-y-1">
            <Skeleton className="h-16 w-56 rounded-lg" />
            <div className="flex items-center gap-2 justify-end">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
          </div>
        </div>

        {/* Message from other user (left aligned) */}
        <div className="flex justify-start">
          <div className="max-w-[70%] space-y-1">
            <Skeleton className="h-12 w-64 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* Message from current user (right aligned) */}
        <div className="flex justify-end">
          <div className="max-w-[70%] space-y-1">
            <Skeleton className="h-8 w-40 rounded-lg" />
            <div className="flex items-center gap-2 justify-end">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
          </div>
        </div>

        {/* Message from other user (left aligned) */}
        <div className="flex justify-start">
          <div className="max-w-[70%] space-y-1">
            <Skeleton className="h-14 w-52 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        {/* Message from current user (right aligned) */}
        <div className="flex justify-end">
          <div className="max-w-[70%] space-y-1">
            <Skeleton className="h-10 w-44 rounded-lg" />
            <div className="flex items-center gap-2 justify-end">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-3 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </div>
  )
}

