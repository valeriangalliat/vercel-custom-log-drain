import type { NextApiRequest, NextApiResponse } from 'next'
import { createLogDrain } from '../../clients/vercel'
import { decrypt } from '../../utils/crypto'
import { getCookie } from '../../utils/http'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405)
  }

  const cookie = getCookie(req)

  if (!cookie.token || !cookie.iv) {
    return res.redirect('/login')
  }

  const token = decrypt(
    Buffer.from(cookie.iv, 'base64url'),
    Buffer.from(cookie.token, 'base64url')
  ).toString()

  await createLogDrain(token, req.body)

  return res.redirect('/configure')
}
