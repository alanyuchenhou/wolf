import { useChat } from 'ai/react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PhoneNumber } from '@/db/schema'

export function PhoneNumberDetails({
  chatId,
  result,
}: {
  chatId: string
  result: PhoneNumber
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phone number details</CardTitle>
        <CardDescription>
          <span>ID: {result.id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        <p>e164: {result.e164}</p>
        <p>Created: {result.createdAt.toString()}</p>
        <p>Updated: {result.updatedAt.toString()}</p>
        <p>Agent ID: {result.agentId}</p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          onClick={() => {
            append({
              role: 'user',
              content: `Assign phone number ${result.e164} with ID ${result.id} to an agent.`,
            })
          }}
        >
          Assign
        </Button>
        <Button
          variant='destructive'
          onClick={() => {
            append({
              role: 'user',
              content: `Delete phone number ${result.e164} with ID ${result.id}.`,
            })
          }}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
