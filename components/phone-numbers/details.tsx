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

interface PhoneNumber {
  id: string
  e164: string
  agentName: string
  createdAt: Date
  updatedAt: Date
}

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
        <p>Number: {result.e164}</p>
        <p>Agent: {result.agentName}</p>
        <p>Created: {result.createdAt.toString()}</p>
        <p>Updated: {result.updatedAt.toString()}</p>
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
