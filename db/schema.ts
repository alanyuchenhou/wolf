import { Message } from 'ai'
import { InferSelectModel } from 'drizzle-orm'
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
  text,
} from 'drizzle-orm/pg-core'

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
})

export type User = InferSelectModel<typeof user>

export const agent = pgTable('Agent', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull().default(''),
  systemInstruction: text('systemInstruction').notNull().default(''),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
})
export type Agent = InferSelectModel<typeof agent>

export const phoneNumber = pgTable('PhoneNumber', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  e164: text('e164').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  agentId: uuid('agentId').references(() => agent.id),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
})

export type PhoneNumber = InferSelectModel<typeof phoneNumber>

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  messages: json('messages').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
})

export type Chat = Omit<InferSelectModel<typeof chat>, 'messages'> & {
  messages: Array<Message>
}

export const reservation = pgTable('Reservation', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  details: json('details').notNull(),
  hasCompletedPayment: boolean('hasCompletedPayment').notNull().default(false),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
})

export type Reservation = InferSelectModel<typeof reservation>
