async function fetchOk(
  url: string,
  init?: RequestInit | undefined
): Promise<Response> {
  const res = await fetch(url, init)

  if (!res.ok) {
    const contentType = res.headers.get('content-type')
    let body: string | object | null

    try {
      const isJson = contentType && contentType.includes('json')
      body = await (isJson ? res.json() : res.text())
    } catch (err) {
      body = null
    }

    throw Object.assign(new Error(`Failed to fetch: ${url}`), {
      res,
      body,
    })
  }

  return res
}

const base = 'https://api.vercel.com'

export async function getToken(code: string): Promise<string> {
  const url = `${base}/v2/oauth/access_token`

  const res = await fetchOk(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.VERCEL_CLIENT_ID!,
      client_secret: process.env.VERCEL_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.VERCEL_REDIRECT_URI!,
    }),
  })

  const json = await res.json()

  return json.access_token
}

// Type from <https://vercel.com/docs/log-drains>
export type LogDrain = {
  /** The oauth2 client application id that created this log drain */
  clientId: string
  /** The client configuration this log drain was created with */
  configurationId: string
  /** A timestamp that tells you when the log drain was created */
  createdAt: number
  /** The unique identifier of the log drain. Always prefixed with `ld_` */
  id: string
  /** The type of log format */
  type: 'json' | 'ndjson' | 'syslog'
  /** The name of the log drain */
  name: string
  /** The identifier of the team or user whose events will trigger the log drain */
  ownerId: string
  /** The identifier of the project this log drain is associated with */
  projectId?: string | null
  /** The URL to call when logs are generated */
  url: string
  /** The sources from which logs are currently being delivered to this log drain */
  sources?: ('static' | 'lambda' | 'build' | 'edge' | 'external')[]
}

export async function getLogDrains(token: string): Promise<LogDrain[]> {
  const url = `${base}/v1/integrations/log-drains`

  const res = await fetchOk(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return await res.json()
}

export async function createLogDrain(
  token: string,
  logDrain: LogDrain
): Promise<LogDrain> {
  const url = `${base}/v1/integrations/log-drains`

  const res = await fetchOk(url, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(logDrain),
  })

  return await res.json()
}

export async function deleteLogDrain(token: string, id: string): Promise<void> {
  const url = `${base}/v1/integrations/log-drains/${encodeURIComponent(id)}`

  await fetchOk(url, {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
