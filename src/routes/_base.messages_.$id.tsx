import ChatMessages from '@/components/chat-messages'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getListing } from '@/lib/functions/listings'
import { getMessagesByThread } from '@/lib/functions/messages'
import type { Message } from '@/lib/message-model'
import socket from '@/lib/socket'
import { useChatstore } from '@/lib/stores/messages'
import type { Thread } from '@/lib/threads-model'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useEffect } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


export const Route = createFileRoute('/_base/messages_/$id')({
  validateSearch: (search: Record<string, any>): Omit<Thread, "last_message" | "last_message_status" | "message_timestamp"> => {
    return {
      thread_id: search.thread_id,
      listing_id: search.listing_id,
      listing_title: search.listing_title,
      sender_id: search.sender_id,
      receiver_id: search.receiver_id,
      correspondent_id: search.correspondent_id,
      correspondent_name: search.correspondent_name,
      correspondent_avatar: search.correspondent_avatar,
    }
  },
  component: RouteComponent,
})


function RouteComponent() {
  const { session } = useRouteContext({ from: '__root__' })
  const thread = Route.useSearch()
  const { id } = Route.useParams()
  const { data } = useSuspenseQuery({
    queryKey: ['messages'],
    queryFn: async () => getMessagesByThread({ data: id })
  })

  const { data: listing } = useSuspenseQuery({
    queryKey: ['listing'],
    queryFn: async () => getListing({ data: thread.listing_id })
  })

  const messageStore = useChatstore()

  useEffect(() => {
    messageStore.setMessages(data)
    const cleanup = socket.onMessage<Message>((m: Message) => {
      if (typeof m === "object") {
        messageStore.addMessage(m)
      }
    })
    socket.connect()

    console.log(messageStore.onlineUsers)
    return () => {
      cleanup()
      socket.close(1000, "Normal Closure")
    }
  }, [data])


  const handleSendMessage = (content: string) => {
    const message: Message = {
      thread_id: thread.thread_id,
      content: content,
      status: "sent",
      sender_id: session?.user.id!,
      receiver_id: thread.correspondent_id,
    }

    socket.sendMessage(message)
  }


  return (
    <div className='flex w-full h-full'>
      <div className='w-1/3 flex flex-col gap-4'>
        <Card>
          <CardHeader className='font-bold'>{thread.listing_title}</CardHeader>
        </Card>
        <Card>
          <CardHeader className='font-bold text-xl'>Customer Details</CardHeader>
          <CardContent>
            <div className='flex flex-col'>
              <div className='flex justify-between max-w-2xl'>Status: {
                messageStore.onlineUsers.has(thread.correspondent_id)
                  ? <Badge variant="default" >Online</Badge>
                  : <Badge variant="destructive">Offline</Badge>
              }
              </div>
              <div className='flex justify-between max-w-2xl'>Name: <span>{thread.correspondent_name}</span></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='font-bold text-xl'>Listing Details</CardHeader>
          <CardContent>
            <div className='flex flex-col gap-6'>
              <p>Title: {listing?.title}</p>
              <div className='flex w-full items-center justify-center'>
                <Carousel
                  className='w-2xs max-w-xs mx-4'
                >
                  <CarouselContent>
                    {listing?.images && listing?.images.map(img => (
                      <CarouselItem>
                        <img className='object-cover h-80 rounded-md w-full' src={img} alt={listing.title} />
                      </CarouselItem>
                    ))}

                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='w-full px-4'>
        <ChatMessages
          messages={messageStore.messages}
          currentUserId={session?.user.id}
          onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}

