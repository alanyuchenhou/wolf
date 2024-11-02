import { ColumnDef } from '@tanstack/react-table'

import { Agent } from '@/app/(chat)/api/agents/types'
import { DataTable } from '@/components/ui/data-table'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Agent>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'created', header: 'Created' },
  { accessorKey: 'updated', header: 'Updated' },
]

export function AgentList({ result }: { result: { agents: Agent[] } }) {
  return (
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={result.agents} />
    </div>
  )
}
