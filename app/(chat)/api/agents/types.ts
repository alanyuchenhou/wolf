export interface Agent {
  id: string
  name: string
  created: string
  updated: string
}

export interface AgentDetails {
  name: string
  details: {
    systemInstruction: string
  }
}
