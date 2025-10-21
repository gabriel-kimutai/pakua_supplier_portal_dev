import { useState } from "react"
import { useRouter } from "@tanstack/react-router"
import { Search, Filter, MessageSquare, MoreHorizontal, Archive, Trash2, CheckCircle2, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from "@tanstack/react-query"
import { getThreads } from "@/lib/functions/threads"

export const Route = createFileRoute('/_base/messages')({
  component: RouteComponent,
})



function RouteComponent() {
  const { data, isFetching } = useQuery({
    queryKey: ['threads'],
    queryFn: getThreads,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })


  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [productFilter, setProductFilter] = useState<string>("all")
  const router = useRouter()

  // Get unique products for filter
  const safeData = data ?? []
  const uniqueProducts = Array.from(
    new Set(
      safeData
        .filter((thread) => thread.thread_id && thread.listing_title)
        .map((thread) => JSON.stringify({ id: thread.thread_id, name: thread.listing_title })),
    ),
  ).map((str) => JSON.parse(str))

  const filteredMessages = safeData.filter((thread) => {
    const matchesSearch =
      thread.correspondent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.listing_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.last_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (thread.listing_title && thread.listing_title.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || thread.last_message_status === statusFilter
    const matchesProduct = productFilter === "all" || thread.listing_id === productFilter

    return matchesSearch && matchesStatus && matchesProduct
  })

  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unread</Badge>
    }

    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
      case "archived":
        return (
          <Badge variant="outline" className="text-gray-500">
            Archived
          </Badge>
        )
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // This year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    // Different year
    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })
  }

  if (isFetching) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-800 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-gray-500">Manage customer inquiries and communications</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {uniqueProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {uniqueProducts.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="divide-y">
          {filteredMessages.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== "all" || productFilter !== "all"
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "When customers send you messages, they will appear here."}
              </p>
            </div>
          ) : (
            filteredMessages.map((thread) => (
              <div
                key={thread.thread_id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${thread.last_message_status ? "bg-blue-50" : ""
                  }`}
                onClick={() => {
                  router.navigate({
                    to: "/messages/$id",
                    params: { id: thread.thread_id.toString() },
                    search: thread
                  })
                }}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={thread.correspondent_avatar || "/placeholder.svg"} alt={thread.correspondent_name} />
                    <AvatarFallback>
                      {thread.correspondent_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${thread.last_message_status ? "text-gray-900" : "text-gray-700"}`}>
                          {thread.correspondent_name}
                        </p>
                        <p className={`text-sm ${thread.last_message_status ? "font-medium text-gray-900" : "text-gray-500"}`}>
                          {thread.listing_title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(thread.message_timestamp)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {thread.listing_id && (
                              <>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  router.navigate({
                                    to: "/manage/$id",
                                    params: { id: thread.listing_id.toString() },
                                  })
                                }}>
                                  <Package className="mr-2 h-4 w-4" />
                                  View Product
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => console.log(`Delete thread ${thread.thread_id}`)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 truncate">{thread.last_message}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getStatusBadge(thread.last_message_status)}
                      {thread.listing_title && (
                        <Badge variant="outline" className="bg-gray-100 hover:bg-gray-100">
                          <Package className="h-3 w-3 mr-1" />
                          {thread.listing_title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredMessages.length > 0 && (
          <div className="p-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {filteredMessages.length} of {data?.length} messages
            </div>
          </div>
        )}
      </div>
    </div >
  )
}
