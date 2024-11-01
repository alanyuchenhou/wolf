import { auth } from '@/app/(auth)/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ callSid: string }> },
) {
  const callSid = (await params).callSid
  if (!callSid) {
    return Response.json('Bad Request: Missing callSid', { status: 400 })
  }

  const session = await auth()

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 })
  }

  const storage_service_url = process.env.GCP_STORAGE_SERVICE_URL
  if (!storage_service_url) {
    throw new Error('Missing required environment variables')
  }
  const response = await fetch(
    `${storage_service_url}/transcriptions/${callSid}`,
  )
  return response
}
