"use client"

import * as React from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CircleCheckIcon, LoaderIcon } from "lucide-react"

import data from "./data.json"

type DataItem = (typeof data)[number]

const columns: ColumnDef<DataItem>[] = [
  {
    accessorKey: "header",
    header: "Header",
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.status === "Done" ? (
          <CircleCheckIcon className="fill-green-500 dark:fill-green-400" />
        ) : (
          <LoaderIcon />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => <div className="text-right">{row.original.target}</div>,
  },
  {
    accessorKey: "limit",
    header: "Limit",
    cell: ({ row }) => <div className="text-right">{row.original.limit}</div>,
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
  },
]

export default function Page() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} columns={columns} enableDnd />
    </div>
  )
}
