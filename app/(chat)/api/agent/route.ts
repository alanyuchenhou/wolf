import { auth } from '@/app/(auth)/auth'

async function createAgent(instructions: string) {
  const putObjectURL = process.env.PUT_OBJECT_URL
  if (!putObjectURL) {
    throw new Error('Missing required environment variables')
  }

  const response = await fetch(putObjectURL, {
    method: 'PUT',
    body: JSON.stringify({ contents: instructions }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
  const agent = await response.json()
  return { name: agent.fileName }
}

export async function PUT(request: Request) {
  const session = await auth()

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 })
  }

  const { instructions } = await request.json()

  const agent = await createAgent(instructions)
  return Response.json(agent)
}
