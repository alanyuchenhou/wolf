import 'server-only'

import { genSaltSync, hashSync } from 'bcrypt-ts'
import { desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { user, chat, User, reservation, phoneNumber, agent } from './schema'

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`)
let db = drizzle(client)

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email))
  } catch (error) {
    console.error('Failed to get user from database')
    throw error
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10)
  let hash = hashSync(password, salt)

  try {
    return await db.insert(user).values({ email, password: hash })
  } catch (error) {
    console.error('Failed to create user in database')
    throw error
  }
}

export async function createAgent({
  name,
  userId,
}: {
  name: string
  userId: string
}) {
  try {
    return await db.insert(agent).values({ name, userId })
  } catch (error) {
    console.error('Failed to create agent in database:', error)
    throw error
  }
}

export async function listAgents({ userId }: { userId: string }) {
  try {
    return await db.select().from(agent).where(eq(agent.userId, userId))
  } catch (error) {
    console.error('Failed to get agent by user from database:', error)
    throw error
  }
}

export async function getAgent({ id }: { id: string }) {
  try {
    const [selectedAgent] = await db
      .select()
      .from(agent)
      .where(eq(agent.id, id))
    return selectedAgent
  } catch (error) {
    console.error('Failed to get agent by id from database:', error)
    throw error
  }
}

export async function updateAgent({
  id,
  name,
  systemInstruction,
}: {
  id: string
  name: string
  systemInstruction: string
}) {
  try {
    return await db
      .update(agent)
      .set({
        name,
        systemInstruction,
        updatedAt: new Date(),
      })
      .where(eq(agent.id, id))
  } catch (error) {
    console.error('Failed to update agent in database:', error)
    throw error
  }
}

export async function deleteAgent({ id }: { id: string }) {
  try {
    return await db.delete(agent).where(eq(agent.id, id))
  } catch (error) {
    console.error('Failed to delete agent by id from database:', error)
    throw error
  }
}

export async function createPhoneNumber(e164: string) {
  try {
    return await db.insert(phoneNumber).values({ e164 })
  } catch (error) {
    console.error('Failed to create phone number in database:', error)
    throw error
  }
}

export async function listPhoneNumbers() {
  try {
    return await db.select().from(phoneNumber)
  } catch (error) {
    console.error('Failed to get phone number', error)
    throw error
  }
}

export async function getPhoneNumber(id: string) {
  try {
    return await db.select().from(phoneNumber).where(eq(phoneNumber.id, id))
  } catch (error) {
    console.error('Failed to get phone number by e164 from database:', error)
    throw error
  }
}

export async function updatePhoneNumber({
  id,
  agentId,
}: {
  id: string
  agentId: string
}) {
  try {
    return await db
      .update(phoneNumber)
      .set({
        agentId,
      })
      .where(eq(phoneNumber.id, id))
  } catch (error) {
    console.error('Failed to update phone number', error)
    throw error
  }
}

export async function deletePhoneNumber(id: string) {
  try {
    return await db.delete(phoneNumber).where(eq(phoneNumber.id, id))
  } catch (error) {
    console.error('Failed to delete chat by id from database')
    throw error
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string
  messages: any
  userId: string
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id))

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id))
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    })
  } catch (error) {
    console.error('Failed to save chat in database')
    throw error
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id))
  } catch (error) {
    console.error('Failed to delete chat by id from database')
    throw error
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt))
  } catch (error) {
    console.error('Failed to get chats by user from database')
    throw error
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id))
    return selectedChat
  } catch (error) {
    console.error('Failed to get chat by id from database')
    throw error
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string
  userId: string
  details: any
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  })
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db
    .select()
    .from(reservation)
    .where(eq(reservation.id, id))

  return selectedReservation
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string
  hasCompletedPayment: boolean
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id))
}
