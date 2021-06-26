const fs = require('fs')
const qs = require('querystring')
const fetch = require('node-fetch')
const fastify = require('fastify')
const formBody = require('fastify-formbody')
const config = require('./config')

const form = fs.readFileSync('form.html', 'utf8')

async function getToken (code) {
  const url = 'https://api.vercel.com/v2/oauth/access_token'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri
    })
  })

  if (!res.ok) {
    throw new Error(`${url} responded with ${res.status}`)
  }

  const json = await res.json()

  return json.access_token
}

async function createLogDrain (token, body) {
  const url = 'https://api.vercel.com/v1/integrations/log-drains'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error(`${url} responded with ${res.status}`)
  }
}

const app = fastify({ logger: true })

app.register(formBody)

app.get('/vercel/callback', (req, res) => {
  if (!req.query.code || !req.query.next) {
    return res.type('text/plain').send('Hello!')
  }

  res.type('text/html').send(form)
})

app.post('/vercel/callback', async (req, res) => {
  if (!req.query.code || !req.query.next || !req.body.type || !req.body.url) {
    return res.code(400)
  }

  const token = await getToken(req.query.code)

  await createLogDrain(token, {
    name: 'custom-log-drain',
    type: req.body.type,
    url: req.body.url
  })

  res.redirect(req.query.next)
})

app.listen(process.env.PORT || 8080, err => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
