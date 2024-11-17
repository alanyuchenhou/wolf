import { ColumnDef } from '@tanstack/react-table'
import { useChat } from 'ai/react'

import { Agent } from '@/app/(chat)/api/agents/types'
import { DataTable } from '@/components/ui/data-table'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Agent>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'created', header: 'Created' },
  { accessorKey: 'updated', header: 'Updated' },
]

export function AgentList({
  chatId,
  result,
}: {
  chatId: string
  result: { agents: Agent[] }
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  })
  return (
    <div className='container mx-auto py-10'>
      <DataTable
        clickMessage='Display the details of agent'
        append={append}
        columns={columns}
        data={result.agents}
      />
    </div>
  )
}
