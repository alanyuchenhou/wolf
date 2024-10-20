export interface Agent {
  name: string
}

export function newAgentConfirmation({ agent }: { agent?: Agent }) {
  return agent ? (
    <div>📞 I will make an agent named {agent.name}.</div>
  ) : (
    <div>I cannot make an agent because the contents are invalid.</div>
  )
}
