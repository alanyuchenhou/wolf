import { auth } from '@/app/(auth)/auth'
import { getAgentsUrl } from '@/app/(chat)/api/urls'

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
  const response = await fetch(`${getAgentsUrl()}/${id}`)
  return response
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

  const { name, details } = await request.json()
  if (!name) {
    return new Response('name is required', { status: 400 })
  }
  if (!details) {
    return new Response('details is required', { status: 400 })
  }
  const response = await fetch(`${getAgentsUrl()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, details }),
    headers: { 'Content-type': 'application/json' },
  })
  return response
}
