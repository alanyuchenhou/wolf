import React, { useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { PhoneCall } from './types'
interface Message {
  role: string
  content: string
}
export function PhoneCallDetails({
  result,
}: {
  result: { phoneCall: PhoneCall; recordingUrl: string }
}) {
  const [transcription, setTranscription] = useState<Message[]>([])
  useEffect(() => {
    const fetchTranscription = async () => {
      const response = await fetch(
        `/api/transcriptions/?callSid=${result.phoneCall.sid}`,
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      setTranscription(data.transcription)
    }
    fetchTranscription()
  }, [result])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{result.phoneCall.time}</CardTitle>
        <CardDescription>
          <span>
            {result.phoneCall.from} → {result.phoneCall.to}
          </span>
          <span> | {result.phoneCall.status}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <audio controls src={result.recordingUrl} />
        <Separator className='my-4' />
        {transcription.map((message: Message, i: number) => (
          <div className={`flex gap-2`} key={i}>
            <span>{message.role === 'assistant' ? '👩‍💼' : '👤'}</span>
            <span>{message.content}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter>summary</CardFooter>
    </Card>
  )
}
