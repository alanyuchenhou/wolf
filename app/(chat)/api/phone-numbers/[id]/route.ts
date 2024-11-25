import { auth } from '@/app/(auth)/auth'
import { updatePhoneNumber } from '@/db/queries'

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

  const { agentId } = await request.json()
  if (!agentId) {
    return new Response('agentId is required', { status: 400 })
  }
  const agent = await updatePhoneNumber({ id, agentId })
  return agent
    ? Response.json(agent)
    : Response.json('Not Found: Phone number does not exist', { status: 404 })
}
