import React, { useEffect, useState } from 'react'

import { AgentDetails } from '@/app/(chat)/api/agents/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function AgentViewer({
  result,
}: {
  result: { id: string; name: string }
}) {
  const [agentdetails, setAgentDetails] = useState<AgentDetails>({
    systemInstruction: '',
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
        <CardTitle>{result.name}</CardTitle>
        <CardDescription>
          <span>ID: {result.id}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h1>System Instruction</h1>
        <Separator className='my-4' />
        <p>{agentdetails.systemInstruction}</p>
      </CardContent>
    </Card>
  )
}
