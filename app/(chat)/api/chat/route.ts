import { convertToCoreMessages, Message, streamText } from 'ai'
import Twilio from 'twilio'
import { z } from 'zod'

import { geminiProModel } from '@/ai'
import {
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from '@/ai/actions'
import { auth } from '@/app/(auth)/auth'
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
  createPhoneNumber,
  listPhoneNumbers,
  getPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  createAgent,
  listAgents,
  deleteAgent,
} from '@/db/queries'
import { generateUUID } from '@/lib/utils'

function twilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    throw new Error('Missing required environment variables')
  }
  return Twilio(accountSid, authToken)
}

async function createPhoneCall(to: string) {
  const from = process.env.TWILIO_PHONE_NUMBER
  const url = process.env.AGENT_URL
  if (!from) {
    throw new Error('Missing required environment variables')
  }

  const twilio = twilioClient()

  const phoneCall = await twilio.calls.create({ from, to, url })
  return phoneCall
}

function formatPhoneCall(call: any) {
  const duration = Number(call.duration)
  return {
    sid: call.sid,
    time: call.startTime.toISOString().split('.')[0],
    duration: new Date(duration * 1000)
      .toISOString()
      .substring(duration > 3600 ? 11 : 14, 19),
    cost: `$${-Number(call.price)}`,
    from: call.from,
    to: call.to,
    status: call.status,
  }
}

async function listPhoneCalls(limit: number) {
  const twilio = twilioClient()
  const calls = await twilio.calls.list({ limit })
  const phoneCalls = calls.map(formatPhoneCall)
  return { phoneCalls }
}

async function getPhoneCallWithRecording(sid: string) {
  const twilio = twilioClient()
  const call = await twilio.calls(sid).fetch()
  const phoneCall = formatPhoneCall(call)
  const recordings = await twilio.recordings.list({ callSid: sid })
  const recordingUrls = recordings.map((recording) => recording.mediaUrl)

  return { phoneCall, recordingUrls }
}

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json()

  const session = await auth()

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  )

  const result = await streamText({
    model: geminiProModel,
    system: `\n
        - keep your responses limited to a sentence.
        - DO NOT output lists.
        - after every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.
        - today's date is ${new Date().toLocaleDateString()}.
        - ask follow up questions to nudge user into the optimal flow.
        - ask for any details you don't know.
        - if the user wants you to display or list agents, call the displayAgents tool.
        - after the user creates an agents, call the displayAgents tool.
        '
      `,
    messages: coreMessages,
    tools: {
      getWeather: {
        description: 'Get the current weather at a location',
        parameters: z.object({
          latitude: z.number().describe('Latitude coordinate'),
          longitude: z.number().describe('Longitude coordinate'),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          )

          const weatherData = await response.json()
          return weatherData
        },
      },
      displayFlightStatus: {
        description: 'Display the status of a flight',
        parameters: z.object({
          flightNumber: z.string().describe('Flight number'),
          date: z.string().describe('Date of the flight'),
        }),
        execute: async ({ flightNumber, date }) => {
          const flightStatus = await generateSampleFlightStatus({
            flightNumber,
            date,
          })

          return flightStatus
        },
      },
      searchFlights: {
        description: 'Search for flights based on the given parameters',
        parameters: z.object({
          origin: z.string().describe('Origin airport or city'),
          destination: z.string().describe('Destination airport or city'),
        }),
        execute: async ({ origin, destination }) => {
          const results = await generateSampleFlightSearchResults({
            origin,
            destination,
          })

          return results
        },
      },
      selectSeats: {
        description: 'Select seats for a flight',
        parameters: z.object({
          flightNumber: z.string().describe('Flight number'),
        }),
        execute: async ({ flightNumber }) => {
          const seats = await generateSampleSeatSelection({ flightNumber })
          return seats
        },
      },
      createReservation: {
        description: 'Display pending reservation details',
        parameters: z.object({
          seats: z.string().array().describe('Array of selected seat numbers'),
          flightNumber: z.string().describe('Flight number'),
          departure: z.object({
            cityName: z.string().describe('Name of the departure city'),
            airportCode: z.string().describe('Code of the departure airport'),
            timestamp: z.string().describe('ISO 8601 date of departure'),
            gate: z.string().describe('Departure gate'),
            terminal: z.string().describe('Departure terminal'),
          }),
          arrival: z.object({
            cityName: z.string().describe('Name of the arrival city'),
            airportCode: z.string().describe('Code of the arrival airport'),
            timestamp: z.string().describe('ISO 8601 date of arrival'),
            gate: z.string().describe('Arrival gate'),
            terminal: z.string().describe('Arrival terminal'),
          }),
          passengerName: z.string().describe('Name of the passenger'),
        }),
        execute: async (props) => {
          const { totalPriceInUSD } = await generateReservationPrice(props)
          const session = await auth()

          const id = generateUUID()

          if (session && session.user && session.user.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props, totalPriceInUSD },
            })

            return { id, ...props, totalPriceInUSD }
          } else {
            return {
              error: 'User is not signed in to perform this action!',
            }
          }
        },
      },
      authorizePayment: {
        description:
          'User will enter credentials to authorize payment, wait for user to repond when they are done',
        parameters: z.object({
          reservationId: z
            .string()
            .describe('Unique identifier for the reservation'),
        }),
        execute: async ({ reservationId }) => {
          return { reservationId }
        },
      },
      verifyPayment: {
        description: 'Verify payment status',
        parameters: z.object({
          reservationId: z
            .string()
            .describe('Unique identifier for the reservation'),
        }),
        execute: async ({ reservationId }) => {
          const reservation = await getReservationById({ id: reservationId })

          if (reservation.hasCompletedPayment) {
            return { hasCompletedPayment: true }
          } else {
            return { hasCompletedPayment: false }
          }
        },
      },
      displayBoardingPass: {
        description: 'Display a boarding pass',
        parameters: z.object({
          reservationId: z
            .string()
            .describe('Unique identifier for the reservation'),
          passengerName: z
            .string()
            .describe('Name of the passenger, in title case'),
          flightNumber: z.string().describe('Flight number'),
          seat: z.string().describe('Seat number'),
          departure: z.object({
            cityName: z.string().describe('Name of the departure city'),
            airportCode: z.string().describe('Code of the departure airport'),
            airportName: z.string().describe('Name of the departure airport'),
            timestamp: z.string().describe('ISO 8601 date of departure'),
            terminal: z.string().describe('Departure terminal'),
            gate: z.string().describe('Departure gate'),
          }),
          arrival: z.object({
            cityName: z.string().describe('Name of the arrival city'),
            airportCode: z.string().describe('Code of the arrival airport'),
            airportName: z.string().describe('Name of the arrival airport'),
            timestamp: z.string().describe('ISO 8601 date of arrival'),
            terminal: z.string().describe('Arrival terminal'),
            gate: z.string().describe('Arrival gate'),
          }),
        }),
        execute: async (boardingPass) => {
          return boardingPass
        },
      },
      makePhoneCall: {
        description: 'Make a phone call to a given phone number',
        parameters: z.object({
          phoneNumber: z.string().describe('the phone number in E.164 format'),
        }),
        execute: async ({ phoneNumber }) => {
          const phoneCall = await createPhoneCall(phoneNumber)
          return phoneCall
        },
      },
      displayAgents: {
        description: 'Display the list of available agents',
        parameters: z.object({
          limit: z
            .number()
            .optional()
            .describe('the number of the agents to display'),
        }),
        execute: async ({ limit }) => {
          if (session && session.user && session.user.id) {
            const agents = await listAgents({ userId: session.user.id })
            return { agents }
          }
          return { error: 'User is not signed in to perform this action!' }
        },
      },
      createAgent: {
        description: 'Create a voice agnet',
        parameters: z.object({
          name: z.string().describe('the name of the agent'),
        }),
        execute: async ({ name }) => {
          if (session && session.user && session.user.id) {
            const agent = await createAgent({ name, userId: session.user.id })
            return { agent: name }
          } else {
            return { error: 'User is not signed in to perform this action!' }
          }
        },
      },
      openAgentEditor: {
        description: 'Open the agent editor for an agent with given ID',
        parameters: z.object({
          id: z.string().describe('the ID of the agent'),
        }),
        execute: async ({ id, name }) => {
          return { id, name }
        },
      },
      openAgentViewer: {
        description: 'Open the agent viewer for an agent with given ID',
        parameters: z.object({
          id: z.string().describe('the ID of the agent'),
        }),
        execute: async ({ id, name }) => {
          return { id, name }
        },
      },
      deleteAgent: {
        description: 'Delete the agent with the given ID',
        parameters: z.object({
          id: z.string().describe('the ID of the agent'),
          name: z.string().describe('the name of the agent'),
        }),
        execute: async ({ id, name }) => {
          const agent = await deleteAgent({ id })
          return { agent: name }
        },
      },
      displayCallHistory: {
        description:
          'Display the list of most recent phone calls up to the given amount limit',
        parameters: z.object({
          limit: z
            .number()
            .describe(
              'the maximum limit of the number of phone calls to display',
            ),
        }),
        execute: async ({ limit }) => {
          const phoneCalls = await listPhoneCalls(limit)
          return phoneCalls
        },
      },
      displayCallDetails: {
        description: 'Display the details of a phone call with the given SID',
        parameters: z.object({
          sid: z.string().describe('the SID of the phone call'),
        }),
        execute: async ({ sid }) => {
          const phoneCallWithRecording = await getPhoneCallWithRecording(sid)
          return phoneCallWithRecording
        },
      },
      createPhoneNumber: {
        description: 'Create a phone number',
        parameters: z.object({
          e164: z.string().describe('the phone number in E.164 format'),
        }),
        execute: async ({ e164 }) => {
          await createPhoneNumber(e164)
          return { phoneNumber: e164 }
        },
      },
      displayPhoneNumbers: {
        description: 'Display the list of available phone numbers',
        parameters: z.object({
          limit: z
            .number()
            .optional()
            .describe('the number of the agents to display'),
        }),
        execute: async () => {
          const phoneNumbers = await listPhoneNumbers()
          return { phoneNumbers }
        },
      },
      displayPhoneNumberDetails: {
        description: 'Display the phone number details given a phone number ID',
        parameters: z.object({
          id: z.string().describe('the ID of the phone number'),
        }),
        execute: async ({ id }) => {
          const phoneNumber = await getPhoneNumber(id)
          return { phoneNumber }
        },
      },
      assignPhoneNumber: {
        description: 'Assign a phone number to an agent',
        parameters: z.object({
          id: z.string().describe('the phone number in E.164 format'),
          agentId: z.string().describe('the ID of the agent'),
        }),
        execute: async ({ id, agentId }) => {
          await updatePhoneNumber({ id, agentId })
          return { id, agentId }
        },
      },
      deletePhoneNumber: {
        description: 'Delete the phone number with the given ID',
        parameters: z.object({
          id: z.string().describe('the ID of the phone number'),
        }),
        execute: async ({ id }) => {
          await deletePhoneNumber(id)
          return { id }
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          })
        } catch (error) {
          console.error('Failed to save chat')
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'stream-text',
    },
  })

  return result.toDataStreamResponse({})
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response('Not Found', { status: 404 })
  }

  const session = await auth()

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const chat = await getChatById({ id })

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    await deleteChatById({ id })

    return new Response('Chat deleted', { status: 200 })
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    })
  }
}
