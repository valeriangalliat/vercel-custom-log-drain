import * as cookie from 'cookie'
import { IncomingMessage, ServerResponse } from 'http'
import { CookieSerializeOptions } from 'next/dist/server/web/types'
import { NextResponse } from 'next/server'

export const isHttps = process.env.VRCL_REDIRECT_URI!.startsWith('https://')

export function getParam(
  param: string | string[] | undefined
): string | undefined {
  return Array.isArray(param) ? param[0] : param
}

export function getArrayParam(param: string | string[] | undefined): string[] {
  if (Array.isArray(param)) {
    return param
  }

  if (typeof param === 'undefined') {
    return []
  }

  return []
}

export function getCookie(
  req: IncomingMessage | undefined
): Record<string, string> {
  return req?.headers.cookie ? cookie.parse(req.headers.cookie) : {}
}

export type Cookie = CookieSerializeOptions & {
  name: string
  value: string
}

export function setCookie(res: ServerResponse, cookies: Cookie | Cookie[]) {
  cookies = Array.isArray(cookies) ? cookies : [cookies]

  res.setHeader(
    'set-cookie',
    cookies.map((c) => cookie.serialize(c.name, c.value, c))
  )
}
