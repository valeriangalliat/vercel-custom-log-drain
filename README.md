# Vercel custom log drain

> Configure a custom log drain on a Vercel app.

<div align="center">

[![Overview](overview.png)](https://vercel.com/integrations/custom-log-drain)

</div>

## Overview

This is the source of a [Vercel integration](https://vercel.com/docs/integrations)
that leverages the [log drains](https://vercel.com/docs/api#integrations/log-drains)
feature of the API to allow you to configure arbitrary log drains on your apps.

By default Vercel only allows you to configure [external logging services](https://vercel.com/integrations?category=logging)
like Datadog, LogDNA and more, but there's no option to manually
configure another service, which is why I wrote this.

Read more on the Vercel blog about [their implementation of log drains](https://vercel.com/blog/log-drains).

## Marketplace integration

For convenience and mostly for my personal usage, I provide a hosted
version of this integration on my own server, which you can find on the
[Vercel marketplace](https://vercel.com/integrations/custom-log-drain).

This service is provided for free and I offer no guarantee on its
availability. If [this page](https://cloud.codejam.info/vercel/callback)
responds, then it means it's up and you can use it.

The only purpose of this integration is to configure a custom log drain
for you (something that Vercel doesn't currently allow you to do). Once
installed, the actual forwarding of logs doesn't depend on this
integration at all.

As you can verify in the [source code](index.js), the app do not store
the access token (or anything whatsoever), meaning that it cannot make
API requests once the installation is completed and the log drain is
configured.

This means that in order to update a log drain URL, you need to remove
the integration and install it again.

## Log drain format

Vercel supports 3 formats: JSON, NDJSON and syslog. See the [API
documentation](https://vercel.com/docs/api#integrations/log-drains/format-and-transport)
for more details.

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
