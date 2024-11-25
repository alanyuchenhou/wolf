import { zodResolver } from '@hookform/resolvers/zod'
import { useChat } from 'ai/react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Suggestions } from '@/components/custom/suggestions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function AgentEditor({
  chatId,
  result,
}: {
  chatId: string
  result: { id: string }
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  })
  const formSchema = z.object({
    name: z
      .string()
      .min(1, { message: 'The agent name can not be empty.' })
      .max(100000, {
        message: 'The agent name can not exceed 100000 characters.',
      }),
    instruction: z
      .string()
      .min(1, { message: 'The system instruction can not be empty.' })
      .max(100000, {
        message: 'The system instruction can not exceed 100000 characters.',
      }),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  useEffect(() => {
    const fetchAgentDetails = async () => {
      const response = await fetch(`/api/agents/${result.id}`)
      const agentdetails = await response.json()
      form.setValue('name', agentdetails.name)
      form.setValue('instruction', agentdetails.systemInstruction)
    }
    fetchAgentDetails()
  }, [result, form])

  async function onFormSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch(`/api/agents/${result.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: values.name,
        systemInstruction: values.instruction,
      }),
      headers: { 'Content-type': 'application/json' },
    })
    append({
      role: 'user',
      content: `I have saved my agent ${values.name} with ID ${result.id}.`,
    })
    return result.id
  }

  return (
    <div className='grid gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>Agent Editor</CardTitle>
          <CardDescription>ID: {result.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className='space-y-2'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='type in the name for your agent'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='instruction'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System instruction</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='type in the system instruction for your agent, such as its role, conversation style, objective, etc'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>Save</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Suggestions suggestions={['Make a phone call']} append={append} />
    </div>
  )
}
