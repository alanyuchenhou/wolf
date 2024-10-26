import { ColumnDef } from '@tanstack/react-table'
import { useChat } from 'ai/react'

import { DataTable } from './data-table'
import { PhoneCall } from './types'

export const columns: ColumnDef<PhoneCall>[] = [
  { accessorKey: 'sid', header: 'SID' },
  { accessorKey: 'time', header: 'Time' },
  { accessorKey: 'duration', header: 'Duration' },
  { accessorKey: 'cost', header: 'Cost' },
  { accessorKey: 'from', header: 'From' },
  { accessorKey: 'to', header: 'To' },
  { accessorKey: 'status', header: 'Status' },
]

export function PhoneCallList({
  chatId,
  result,
}: {
  chatId: string
  result: { phoneCalls: PhoneCall[] }
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  })
  return (
    <div className='container mx-auto py-10'>
      <DataTable append={append} columns={columns} data={result.phoneCalls} />
    </div>
  )
}
