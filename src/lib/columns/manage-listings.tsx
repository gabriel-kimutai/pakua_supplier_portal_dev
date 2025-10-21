import type { ColumnDef } from "@tanstack/react-table";

import { Edit2Icon, MoreHorizontal, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-header";
import { useRouter } from "@tanstack/react-router";
import type { Listing } from "../listing-model";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const listingsColumns: ColumnDef<Listing>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
  },
  {
    accessorKey: "attributes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Attributes" />
    ),
    cell: ({ row }) => {
      const attributes = row.original.attributes;
      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="attribues">
            <AccordionTrigger>Attributes</AccordionTrigger>
            <AccordionContent>
              {Object.entries(attributes).map(([key, value]) => (
                <li className="flex justify-between w-full" key={key}>
                  <span>{key}</span>
                  <span>{value}</span>
                </li>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const listing = row.original;

      const router = useRouter();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                router.navigate({
                  to: "/manage/$id",
                  params: { id: listing.id.toString() },
                })
              }
              className="cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <span>
                  <Edit2Icon />
                </span>
                <span className="text-xs text-muted-foreground">Edit</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(listing.user_id.toString())
              }
            >
              <div className="flex items-center space-x-2 ">
                <span>
                  <Trash2Icon color={"red"} />
                </span>
                <span className="text-xs text-muted-foreground">Delete</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
