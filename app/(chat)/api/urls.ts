export function getAgentsUrl() {
  const storage_service_url = process.env.GCP_STORAGE_SERVICE_URL
  if (!storage_service_url) {
    throw new Error('Missing required environment variables')
  }
  return `${storage_service_url}/agents`
}
