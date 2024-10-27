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
  result: { phoneCall: PhoneCall; recordingUrls: string[] }
}) {
  const [transcription, setTranscription] = useState<Message[]>([])
  useEffect(() => {
    const fetchTranscription = async () => {
      const response = await fetch(
        `/api/transcriptions/?callSid=${result.phoneCall.sid}`,
      )
      const transcription = await response.json()
      setTranscription(transcription)
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
        {result.recordingUrls.map((recordingUrl) => (
          <audio controls key={recordingUrl} src={recordingUrl} />
        ))}
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
