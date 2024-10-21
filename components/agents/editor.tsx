import { zodResolver } from '@hookform/resolvers/zod'
import { useChat } from 'ai/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import { Suggestions } from '../custom/suggestions'

export function AgentEditor({
  chatId,
  agent,
}: {
  chatId: string
  agent?: any
}) {
  const { append } = useChat({
    id: chatId,
    body: { id: chatId },
    maxSteps: 5,
  })
  const formSchema = z.object({
    instructions: z
      .string()
      .min(1, { message: 'The system instructions can not be empty.' })
      .max(100000, {
        message: 'The system instructions can not exceed 100000 characters.',
      }),
  })

  async function onFormSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch(`/api/agent`, {
      method: 'PUT',
      body: JSON.stringify({ instructions: values.instructions }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
    const agent = await response.json()
    toast.success(`Agent ${agent.name} saved successfully`)
    append({
      role: 'user',
      content: `I have saved my agent ${agent.name}`,
    })
    return agent
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instructions: '',
    },
  })

  return (
    <div className='grid gap-4'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className='space-y-2'>
          <FormField
            control={form.control}
            name='instructions'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent {agent.name} system instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='type in the system instructions for your agent, such as its role, conversation style, objective, etc'
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
      <Suggestions suggestions={['Make a phone call']} append={append} />
    </div>
  )
}
