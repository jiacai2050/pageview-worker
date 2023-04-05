export default {
  async fetch(req, env, ctx) {
    try {
      const { pathname, searchParams } = new URL(req.url);
      switch (pathname) {
      case "/write":
        return await write(req, env, searchParams);
      case "/read":
        return await read(req, env, searchParams);
      default:
        return new Response(`<h1>Unknown request, ${req.url}</h1>`, {
          status: 400,
          headers: new Headers({
            "Content-Type": "text/html; charset=utf-8",
          })
        });
      }
    } catch (err) {
      console.error(err.message, err.name);
      console.log(JSON.stringify([...req.headers]));
      console.log(JSON.stringify(req));
      return new Response(`<h1>${err.message}</h1>`, {
        status: 500,
        headers: new Headers({
          "Content-Type": "text/html; charset=utf-8",
        })
      });
    }
  },
};

async function read(req, env, searchParams) {
  const value = await env['KV'].list({});
  return renderAsJSON(value);
}

function renderAsJSON(value) {
  let result = {
    list_complete: value['list_complete'],
    keys: []
  };
  for(const v of value['keys']) {
    result.keys.push({
      time: Number.MAX_SAFE_INTEGER - parseInt(v['name']),
      metadata: v['metadata']
    });
  }

  return new Response(JSON.stringify(result), {
    headers: new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      'Access-Control-Allow-Origin': '*'
    })
  });
}

async function write(req, env, searchParams) {
  const url = searchParams.get('url');
  if(!url) {
    return new Response(`<h1>URL is not set.</h1>`, {
      status: 400,
    });
  }

  const ip = req.headers.get('cf-connecting-ip');
  const ua = req.headers.get('user-agent');
  const title = searchParams.get('title');
  const referrer = searchParams.get('referrer');
  const cf = req.cf || {};

  const now = new Date().getTime();
  const key = Number.MAX_SAFE_INTEGER - now;
  await env['KV'].put(String(key), '', {
    expirationTtl: 3600 * 24 * 300, // 300 days
    metadata: {
      url: url,
      title: title,
      referrer: referrer,
      ua: ua,
      ip: ip,
      country: cf['country'],
      city: cf['city'],
    },
  });

  return new Response(null, {
    headers: new Headers({
      "Content-Type": "image/gif",
      "Cache-Control": "private, max-age=0, no-cache",
      "Pragma": "no-cache",
      "Date": Date().toLocaleString()
    }),
  });

}
