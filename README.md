# cors-server.js

A simple CORS proxy server with configurable allowed domains.

See `example.env` for config options.

## Install

Install `node`:

```sh
curl https://webi.sh/node | sh
source ~/.config/envman/PATH.env
```

Run `cors-server`

```bash
git clone https://github.com/dashhive/cors-server.js
pushd ./cors-server.js/

./bin/cors-server.js --prefix /api/cors/ --port 2677 --domains 'example.com, example.org'
```

## Usage

### localhost https with Caddy

`./Caddyfile`:

```Caddyfile
https://localhost:443 {
    handle_path /api/* {
        rewrite * /api{path}
        reverse_proxy localhost:2677
    }
}
```

```sh
curl https://webi.sh/caddy | sh
source ~/.config/envman/PATH.env
```

```sh
caddy run --config Caddyfile
```

### Test in browser

```js
await fetch("https://localhost/api/cors/example.com/", { mode: "cors" });
```

### Run as a Service

```sh
curl https://webi.sh/serviceman | sh
source ~/.config/envman/PATH.env
```

```sh
sudo env PATH="$PATH" \
    serviceman add --system -- \
    ./bin/cors-server.js --
        --port 2677 \
        --prefix /api/cors/ \
        --domains example.com
```

```sh
sudo env PATH="$PATH" \
    serviceman add --system --cap-net-bind -- \
    caddy run --config ./Caddyfile
```
