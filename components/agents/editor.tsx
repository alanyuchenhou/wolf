import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  instructions: z.string().min(1).max(100000),
})

export async function onFormSubmit(values: z.infer<typeof formSchema>) {
  const response = await fetch(`/api/agent`, {
    method: 'PUT',
    body: JSON.stringify({ instructions: values.instructions }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
  const agent = await response.json()
  toast.success(`Agent ${agent.name} saved successfully`)
  return agent
}

export function AgentEditor({ agent }: { agent?: any }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instructions: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className='space-y-2'>
        <FormField
          control={form.control}
          name='instructions'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent {agent.name} system instructions</FormLabel>
              <FormControl>
                <Input
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
  )
}
