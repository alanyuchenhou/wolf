import { ColumnDef } from '@tanstack/react-table'
import { useChat } from 'ai/react'

import { Suggestions } from '@/components/custom/suggestions'
import { DataTable } from '@/components/ui/data-table'
import { PhoneNumber } from '@/db/schema'

export const columns: ColumnDef<PhoneNumber>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'e164', header: 'Number' },
  { accessorKey: 'agentId', header: 'Agent ID' },
]

export function PhoneNumberList({
  chatId,
  result,
}: {
  chatId: string
  result: { phoneNumbers: PhoneNumber[] }
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  })
  return (
    <div className='grid gap-4'>
      <DataTable
        clickMessage='Display the details of phone number'
        append={append}
        columns={columns}
        data={result.phoneNumbers}
      />
      <Suggestions
        suggestions={['Create a phone number', 'Make a phone call']}
        append={append}
      />
    </div>
  )
}
