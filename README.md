# Vercel custom log drain

> Configure a custom log drain on a Vercel app.

<div align="center">

[![Overview](overview.png)](https://vercel.com/integrations/custom-log-drain)

</div>

[**Install on Vercel!**](https://vercel.com/integrations/custom-log-drain)

## Overview

**Vercel custom log drain** is a [Vercel integration](https://vercel.com/integrations/custom-log-drain)
that allows you to send your Vercel logs to the destinations of your
choice.

By default Vercel only allows you to configure [external logging services](https://vercel.com/integrations?category=logging)
like Datadog, LogDNA and more through the Vercel marketplace, but
there's no option to use your own.

Thanks to this generic integration, you can simply configure the log
format and URL where you want to send your logs!

**Note:** if you're looking for a simple way to store logs in text files
on a server you control, see [making a simple log drain with nginx](#making-a-simple-log-drain-with-nginx).

## Log drain formats

Vercel supports 3 formats: JSON, NDJSON and syslog. See the
[API documentation](https://vercel.com/docs/rest-api#introduction/api-basics/format-and-transport)
for more details.

## Technical details & design

This integration is hosted on Vercel, on <https://custom-drain.vercel.app/>.

It uses the [log drains](https://vercel.com/docs/api#integrations/log-drains)
API to allow you to configure arbitrary log drains on your apps.

**It is designed to be entirely stateless.** There's no database and
nothing is stored server-side (because I provide this service for free
and I'd like to keep hosting it for free too 😏).

Because of that, the token that Vercel provides when you install the
integration to call the API is only stored (encrypted) in your browser
cookies. You're also given an opportunity to store the (encrypted) token
in your password manager, or in your bookmarks using a special link, so
that you have the ability to view, add or delete your log drains later
on, as well as share it with your team.

Useful read: [Vercel integrations](https://vercel.com/docs/integrations).

## Development

### Create a new Vercel integration

For local development, you need to create a new Vercel integration to
test with. You can do that from the [integrations
console](https://vercel.com/dashboard/integrations/console).

For the logo, I used Apple's [wood emoji](https://emojipedia.org/apple/ios-14.6/wood/)
and the [`integration.png`](integration.png) image as (mandatory) feature
media.

**Redirect URL:** `http://localhost:3030/install`  
**Configuration URL:** `http://localhost:3030/configure`

### Clone and configure

```sh
git clone https://github.com/valeriangalliat/vercel-custom-log-drain.git
cd vercel-custom-log-drain
npm install
```

Create a `.env` file and add the following contents:

```env
VRCL_CLIENT_ID=
VRCL_CLIENT_SECRET=
VRCL_REDIRECT_URI=http://localhost:3030/install
AES_KEY=
```

For `VRCL_CLIENT_ID` and `VRCL_CLIENT_SECRET`, put the client ID and
secret that Vercel gave you when you created the integration.

**Note:** the environment variables use `VRCL_` and not `VERCEL_` prefix
because the `VERCEL_` prefix cannot be used for arbitrary variables when
hosting on Vercel.

The `AES_KEY` is used to encrypt the Vercel tokens to be stored in the
user's browser. You can generate a key using the following command:

```sh
node -p "crypto.randomBytes(32).toString('base64url')"
```

### Start

Finally, start the development server:

```sh
npm start
```

## Making a simple log drain with nginx

If you already have a server running nginx somewhere, you can use it as
a very simple log drain that's compatible with Vercel.

In the following examples, merge the `http` and `server` blocks to your
existing configuration.

```nginx
# Make sure this is loaded, method may vary depending on your setup.
load_module modules/ngx_http_echo_module.so;

http {
    # Define a log format called `postdata`, that will output just the request body, unescaped.
    log_format postdata escape=none $request_body;
}

server {
    location /vercel/drain {
        access_log off;

        if ($request_method = POST) {
            # Wherever you want to store your logs.
            access_log /path/to/vercel.log postdata;

            # Required to force nginx to read the request body,
            # otherwise it won't log anything.
            echo_read_request_body;
        }
    }
}
```

Then you can use this integration to configure
`https://your.domain/vercel/drain` as a log drain. I find that NDJSON
works best with this format.

If you don't want to load `ngx_http_echo_module`, you can instead use
the native `proxy_pass` directive to force nginx to read the request
body.

```nginx
server {
    location /vercel/empty {
      return 204;
    }

    location /vercel/drain {
        access_log off;

        if ($request_method = POST) {
            access_log /path/to/vercel.log postdata;

            # Adapt this to whatever your server responds to, or
            # feel free to use `$scheme`, `$server_name`, `$host`,
            # `$server_port` and so on.
            proxy_pass http://localhost/vercel/empty;
        }
    }
}
```
