import { auth } from '@/app/(auth)/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id
  if (!id) {
    return Response.json('Bad Request: Missing id', { status: 400 })
  }

  const session = await auth()

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 })
  }

  const storage_service_url = process.env.GCP_STORAGE_SERVICE_URL
  if (!storage_service_url) {
    throw new Error('Missing required environment variables')
  }
  const response = await fetch(`${storage_service_url}/agents/${id}`)
  return response
}
