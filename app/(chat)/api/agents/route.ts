import { auth } from '@/app/(auth)/auth'

export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 })
  }

  const { name, systemInstruction } = await request.json()
  if (!name) {
    return new Response('name is required', { status: 400 })
  }
  if (!systemInstruction) {
    return new Response('systemInstruction is required', { status: 400 })
  }

  const storage_service_url = process.env.GCP_STORAGE_SERVICE_URL
  if (!storage_service_url) {
    throw new Error('Missing required environment variables')
  }

  const response = await fetch(`${storage_service_url}/agents`, {
    method: 'POST',
    body: JSON.stringify({ name, systemInstruction }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
  return response
}
