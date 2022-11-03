import type { NextApiRequest, NextApiResponse } from 'next'
import { isHttps, setCookie } from '../../utils/http'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405)
  }

  setCookie(res, [
    {
      name: 'token',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: -1,
      secure: isHttps,
    },
    {
      name: 'iv',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: -1,
      secure: isHttps,
    },
    {
      name: 'team',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: -1,
      secure: isHttps,
    },
  ])

  return res.redirect('/login')
}
