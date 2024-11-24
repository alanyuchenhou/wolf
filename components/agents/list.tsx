import { ColumnDef } from '@tanstack/react-table'
import { useChat } from 'ai/react'

import { Agent } from '@/app/(chat)/api/agents/types'
import { DataTable } from '@/components/ui/data-table'

import { Suggestions } from '../custom/suggestions'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Agent>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'updatedAt', header: 'Updated' },
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
    <div className='grid gap-4'>
      <DataTable
        clickMessage='Open the agent viewer for agent'
        append={append}
        columns={columns}
        data={result.agents}
      />
      <Suggestions
        suggestions={['Create an agent', 'Make a phone call']}
        append={append}
      />
    </div>
  )
}
