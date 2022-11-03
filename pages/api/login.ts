import type { NextApiRequest, NextApiResponse } from 'next'
import { encrypt } from '../../utils/crypto'
import { isHttps, setCookie } from '../../utils/http'
import crypto from 'node:crypto'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  if (!req.body.password) {
    return res.status(400).end()
  }

  const iv = crypto.randomBytes(16)
  const token = encrypt(iv, Buffer.from(req.body.password))

  setCookie(res, [
    {
      name: 'token',
      value: token.toString('base64url'),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
      secure: isHttps,
    },
    {
      name: 'iv',
      value: iv.toString('base64url'),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
      secure: isHttps,
    },
  ])

  return res.redirect('/configure')
}
