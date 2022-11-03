import { InferGetServerSidePropsType, NextPageContext } from 'next'
import { getParam, isHttps, setCookie } from '../utils/http'
import * as vercel from '../clients/vercel'
import crypto from 'node:crypto'
import { encrypt } from '../utils/crypto'
import Link from 'next/link'
import getRawBody from 'raw-body'

export async function getServerSideProps(context: NextPageContext) {
  const method = context.req?.method
  const next = getParam(context.query.next)
  let token: string

  if (method === 'POST') {
    const body = new URLSearchParams(
      (await getRawBody(context.req!)).toString()
    )

    if (!body.has('password')) {
      throw new Error('Invalid body')
    }

    token = body.get('password')!
  } else {
    const code = getParam(context.query.code)

    if (!code || !next) {
      throw new Error('Missing `code` or `next` param')
    }

    token = await vercel.getToken(code)
  }

  const iv = crypto.randomBytes(16)
  const encryptedToken = encrypt(iv, Buffer.from(token))

  setCookie(context.res!, [
    {
      name: 'token',
      value: encryptedToken.toString('base64url'),
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

  const baseUrl = new URL(process.env.VERCEL_REDIRECT_URI!)
  baseUrl.pathname = '/configure'
  baseUrl.searchParams.set('token', encryptedToken.toString('base64url'))
  baseUrl.searchParams.set('iv', iv.toString('base64url'))

  const secretUrl = baseUrl.toString()

  return {
    props: {
      token,
      method,
      next,
      secretUrl,
    },
  }
}

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <div className="container text-center" style={{ maxWidth: 960 }}>
      <h1 className="h3 my-3">Integration installed!</h1>
      <p>
        Your token was saved in this browser so that you find your log drains
        any time you come back here.
      </p>
      <p>
        Use the below form to give it a nickname and save it to your password
        manager.
      </p>
      <form method="post" className="mb-3">
        <style jsx>{`
          .form-floating:focus-within {
            z-index: 2;
          }
        `}</style>
        <div className="d-flex justify-content-center">
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            name="username"
            id="username"
            style={{
              marginRight: -1,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          />
          <input
            type="password"
            className="visually-hidden"
            name="password"
            id="password"
            value={props.token}
          />
          <button
            className="btn btn-sm btn-primary"
            type="submit"
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            Save
          </button>
        </div>
      </form>
      <p className="my-3">
        You can also use your secret URL to access this configuration from
        anywhere else and share it with your team:
        <br />
        <Link href={props.secretUrl}>{props.secretUrl}</Link>
      </p>
      <p>
        <a className="btn btn-lg btn-primary" href={props.next}>
          Continue
        </a>
      </p>
    </div>
  )
}
