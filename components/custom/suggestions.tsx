import { Button } from '@/components/ui/button'

export function Suggestions({
  suggestions,
  append,
}: {
  suggestions: string[]
  append: any
}) {
  return (
    <div className='flex flex-col sm:flex-row items-start gap-2'>
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          onClick={() => {
            append({ role: 'user', content: suggestion })
          }}
        >
          ✨ {suggestion}
        </Button>
      ))}
    </div>
  )
}
