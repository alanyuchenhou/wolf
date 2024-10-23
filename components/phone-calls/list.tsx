import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PhoneCall {
  startTime: string
  duration: string
  price: string
  status: string
}

export function PhoneCallList({
  result,
}: {
  result: { phoneCalls: PhoneCall[] }
}) {
  return (
    <Table>
      <TableCaption>A list of your most recent phone calls.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className='w-[190px]'>Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.phoneCalls.map((call, index) => (
          <TableRow key={index}>
            <TableCell>{call.startTime.split('.')[0]}</TableCell>
            <TableCell>{call.duration}s</TableCell>
            <TableCell>${-Number(call.price)}</TableCell>
            <TableCell>{call.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
