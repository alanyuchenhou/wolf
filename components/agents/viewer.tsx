import { useChat } from 'ai/react'
import React, { useEffect, useState } from 'react'

import { Agent } from '@/app/(chat)/api/agents/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function AgentViewer({
  chatId,
  result,
}: {
  chatId: string
  result: { id: string }
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  })
  const [agentDetails, setAgentDetails] = useState<Agent>()
  useEffect(() => {
    const fetchAgentDetails = async () => {
      const response = await fetch(`/api/agents/${result.id}`)
      if (response.ok) {
        const agentdetails = await response.json()
        setAgentDetails(agentdetails)
      }
    }
    fetchAgentDetails()
  }, [result])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Viewer</CardTitle>
        <CardDescription>
          <span>ID: {result.id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        <p>Name: {agentDetails?.name}</p>
        <p>Created: {agentDetails?.createdAt}</p>
        <p>Updated: {agentDetails?.updatedAt}</p>
        <Separator className='my-4' />
        <h1>System Instruction</h1>
        <p>{agentDetails?.systemInstruction}</p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          onClick={() => {
            append({
              role: 'user',
              content: `Open the agent editor for agent ${agentDetails?.name} with ID ${result.id}.`,
            })
          }}
        >
          Edit
        </Button>
        <Button
          variant='destructive'
          onClick={() => {
            append({
              role: 'user',
              content: `Delete agent ${agentDetails?.name} with ID ${result.id}.`,
            })
          }}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
