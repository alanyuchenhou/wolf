import { auth } from '@/app/(auth)/auth'

async function getTranscription(callSid: string) {
  const storage_service_url = process.env.GCP_STORAGE_SERVICE_URL
  if (!storage_service_url) {
    throw new Error('Missing required environment variables')
  }
  const response = await fetch(
    `${storage_service_url}/transcriptions/${callSid}`,
  )
  const transcription = await response.json()
  return { transcription }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const callSid = searchParams.get('callSid')
  if (!callSid) {
    return Response.json('Bad Request: Missing callSid', { status: 400 })
  }

  const session = await auth()

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 })
  }

  const transcription = await getTranscription(callSid)
  return Response.json(transcription)
}
