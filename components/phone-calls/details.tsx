import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { PhoneCall } from './types'

export function PhoneCallDetails({
  result,
}: {
  result: { phoneCall: PhoneCall; recordingUrl: string }
}) {
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
      </CardContent>
      <CardFooter>
        <p>Transcription:</p>
      </CardFooter>
    </Card>
  )
}
