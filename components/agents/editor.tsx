import { zodResolver } from '@hookform/resolvers/zod'
import { useChat } from 'ai/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

import { Suggestions } from '../custom/suggestions'

export function AgentEditor({
  chatId,
  result,
}: {
  chatId: string
  result: { name: string }
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

  async function onFormSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch(`/api/agents`, {
      method: 'POST',
      body: JSON.stringify({
        name: values.name,
        systemInstruction: values.instruction,
      }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
    const { id } = await response.json()
    append({
      role: 'user',
      content: `I have saved my agent ${values.name}.`,
    })
    return id
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: result.name,
      instruction: '',
    },
  })

  return (
    <div className='grid gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>New Agent</CardTitle>
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
