import { InferGetServerSidePropsType, NextPageContext } from 'next'
import { getCookie, getParam } from '../utils/http'
import { getLogDrains } from '../clients/vercel'
import Link from 'next/link'
import { decrypt } from '../utils/crypto'

export async function getServerSideProps(context: NextPageContext) {
  let encryptedToken = getParam(context.query.token)
  let iv = getParam(context.query.iv)
  let team = getParam(context.query.team)

  if (!encryptedToken || !iv) {
    const cookie = getCookie(context.req)

    if (!cookie.token || !cookie.iv) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }

    encryptedToken = cookie.token
    iv = cookie.iv
    team = cookie.team
  }

  const token = decrypt(
    Buffer.from(iv, 'base64url'),
    Buffer.from(encryptedToken, 'base64url')
  ).toString()

  const logDrains = await getLogDrains(token, team)

  const baseUrl = new URL(process.env.VRCL_REDIRECT_URI!)
  baseUrl.pathname = '/configure'
  baseUrl.searchParams.set('token', encryptedToken)
  baseUrl.searchParams.set('iv', iv)

  if (team) {
    baseUrl.searchParams.set('team', team)
  }

  const secretUrl = baseUrl.toString()

  return {
    props: {
      logDrains,
      secretUrl,
    },
  }
}

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/configure">
            Custom log drain
          </Link>
          <form action="/api/logout" method="post">
            <button className="btn btn-link text-decoration-none" type="submit">
              Log out
            </button>
          </form>
        </div>
      </nav>
      <div className="container mt-5">
        <table className="table">
          {props.logDrains.length > 0 ? (
            <>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Sources</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {props.logDrains.map(drain => (
                  <tr key={drain.id}>
                    <td>{drain.type}</td>
                    <td>{drain.name}</td>
                    <td>{drain.url}</td>
                    <td>{drain.sources?.join(', ')}</td>
                    <td>
                      <form action="/api/delete" method="post">
                        <input type="hidden" name="id" value={drain.id} />
                        <button className="btn btn-sm btn-danger" type="submit">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          ) : null}
          <tfoot>
            <tr>
              <th>
                <label htmlFor="type">Type</label>
              </th>
              <th>
                <label htmlFor="name">Name</label>
              </th>
              <th>
                <label htmlFor="url">URL</label>
              </th>
              <th>
                <label htmlFor="sources">Sources</label>
              </th>
              <th>Actions</th>
            </tr>
            <tr className="align-top">
              <td>
                <select
                  form="add"
                  className="form-select"
                  name="type"
                  id="type"
                >
                  <option value="json">json</option>
                  <option value="ndjson">ndjson</option>
                  <option value="syslog">syslog</option>
                </select>
              </td>
              <td>
                <input
                  form="add"
                  type="text"
                  className="form-control"
                  name="name"
                  id="name"
                />
              </td>
              <td>
                <input
                  form="add"
                  type="text"
                  className="form-control"
                  name="url"
                  id="url"
                />
              </td>
              <td>
                <select
                  form="add"
                  className="form-select"
                  id="sources"
                  multiple
                  defaultValue={[
                    'static',
                    'lambda',
                    'build',
                    'edge',
                    'external',
                  ]}
                >
                  <option value="static">static</option>
                  <option value="lambda">lambda</option>
                  <option value="build">build</option>
                  <option value="edge">edge</option>
                  <option value="external">external</option>
                </select>
              </td>
              <td>
                <button form="add" type="submit" className="btn btn-primary">
                  Add
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
        <h3 className="mt-5">Accessing your configuration</h3>
        <p>
          The custom log drain integration is stateless and doesn&apos;t store
          anything. This means that you need to save your Vercel integration
          credentials in order to edit the configuration. Oherwise, you can
          always delete the integration and install it again.
        </p>
        <p>
          In order to save your Vercel integration credentials, you can either
          use the form below to give it a nickname and save it to your password
          manager, or save the &quot;secret link&quot; below as a bookmark.
        </p>
        <form id="add" action="/api/create" method="post"></form>
        <form method="post" className="mb-3">
          <style jsx>{`
            .form-floating:focus-within {
              z-index: 2;
            }
          `}</style>
          <div className="d-flex">
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
              value={props.secretUrl}
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
        <p>
          Secret link: <Link href={props.secretUrl}>{props.secretUrl}</Link>
        </p>
      </div>
    </>
  )
}
