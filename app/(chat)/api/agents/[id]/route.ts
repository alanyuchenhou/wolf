import { auth } from '@/app/(auth)/auth'
import { getAgent, updateAgent } from '@/db/queries'

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
  const agent = await getAgent({ id })
  return agent
    ? Response.json(agent)
    : Response.json('Not Found: Agent does not exist', { status: 404 })
}

export async function PUT(
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

  const { name, systemInstruction } = await request.json()
  if (!name) {
    return new Response('name is required', { status: 400 })
  }
  if (!systemInstruction) {
    return new Response('systemInstruction is required', { status: 400 })
  }
  const agent = await updateAgent({ id, name, systemInstruction })
  return agent
    ? Response.json(agent)
    : Response.json('Not Found: Agent does not exist', { status: 404 })
}
