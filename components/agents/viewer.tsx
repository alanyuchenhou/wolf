import { useChat } from 'ai/react'
import React, { useEffect, useState } from 'react'

import { AgentDetails } from '@/app/(chat)/api/agents/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function AgentViewer({
  chatId,
  result,
}: {
  chatId: string
  result: { id: string; name: string }
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  })
  const [agentdetails, setAgentDetails] = useState<AgentDetails>({
    name: '',
    details: {
      systemInstruction: '',
    },
  })
  useEffect(() => {
    const fetchAgentDetails = async () => {
      const response = await fetch(`/api/agents/${result.id}`)
      const agentdetails = await response.json()
      setAgentDetails(agentdetails)
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
      <CardContent>
        <h1>Name</h1>
        <p>{agentdetails.name}</p>
        <Separator className='my-4' />
        <h1>System Instruction</h1>
        <p>{agentdetails.details.systemInstruction}</p>
      </CardContent>
      <Button
        onClick={() => {
          append({
            role: 'user',
            content: `Open the agent editor for agent with name ${result.name} with ID ${result.id}.`,
          })
        }}
      >
        Edit
      </Button>
    </Card>
  )
}
