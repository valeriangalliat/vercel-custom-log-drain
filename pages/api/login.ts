import type { NextApiRequest, NextApiResponse } from 'next'
import { isHttps, setCookie } from '../../utils/http'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  if (!req.body.password) {
    return res.status(400).end()
  }

  const url = new URL(req.body.password)

  console.log('URL', url)

  const token = url.searchParams.get('token')
  const iv = url.searchParams.get('iv')
  const team = url.searchParams.get('team')

  if (!token || !iv) {
    return res.status(403).end()
  }

  const cookies = [
    {
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
      secure: isHttps,
    },
    {
      name: 'iv',
      value: iv,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
      secure: isHttps,
    },
  ]

  if (team) {
    cookies.push({
      name: 'team',
      value: team,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
      secure: isHttps,
    })
  }

  setCookie(res, cookies)

  return res.redirect('/configure')
}
