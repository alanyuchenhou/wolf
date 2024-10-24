import { ColumnDef } from '@tanstack/react-table'

import { DataTable } from './data-table'

type PhoneCall = {
  sid: string
  time: string
  duration: string
  cost: string
  from: string
  to: string
  status: string
}

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
  result,
}: {
  result: { phoneCalls: PhoneCall[] }
}) {
  return (
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={result.phoneCalls} />
    </div>
  )
}
