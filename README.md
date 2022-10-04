# cors-server.js

A simple CORS proxy server with configurable allowed domains.

## QuickStart

1. Install `node`
   ```sh
   curl https://webi.sh/node | sh
   source ~/.config/envman/PATH.env
   ```
2. Download and enter the project directory
   ```bash
   git clone https://github.com/dashhive/cors-server.js
   pushd ./cors-server.js/
   ```
3. Run `cors-server` with config options
   ```sh
   # ./bin/cors-server.js [flags]
   ./bin/cors-server.js --prefix /api/cors/ --port 2677 --domains 'example.com, example.org'
   ```
4. Test with `curl`
   ```sh
   curl http://localhost:2677/api/cors/example.com
   ```
   (browser testing requires https, see below)

## Usage

### Configuration

You can either set command line flags, or set ENVs. Flags take precedence.

| flag      | ENV                   | example                    | description    |
| :-------- | :-------------------- | :------------------------- | :------------- |
| --port    | PORT=                 | 2677                       | _Number_       |
| --prefix  | CORS_PROXY_PREFIX=    | /api/cors/                 | _URL Path_     |
| --domains | CORS_ALLOWED_DOMAINS= | 'example.com, example.org' | _URL Hostname_ |

See [`./example.env`](./example.env) for config options.

### Set HTTPS for localhost with Caddy

1. Install `caddy`
   ```sh
   curl https://webi.sh/caddy | sh
   source ~/.config/envman/PATH.env
   ```
2. Create `./Caddyfile`
   ```Caddyfile
   https://localhost:443 {
       handle /api/* {
           reverse_proxy localhost:2677
       }
   }
   ```
3. Run caddy and localhost https will be generated
   ```sh
   caddy run --config ./Caddyfile
   ```

### Test in a browser console

1. Open the JavaScript console \
   <kbd>Cmd ⌘ + Alt ⌥ + I</kbd>
2. Test it out with `fetch`
   ```js
   await fetch("https://localhost/api/cors/example.com/", { mode: "cors" });
   ```

### Run as a Service

1. Install Serviceman
   ```sh
   curl https://webi.sh/serviceman | sh
   source ~/.config/envman/PATH.env
   ```
2. Generate and enable service file for `cors-server`
   ```sh
   sudo env PATH="$PATH" \
       serviceman add --system -- \
           ./bin/cors-server.js --
               --port 2677 \
               --prefix /api/cors/ \
               --domains example.com
   ```
3. Generate and enable service file for `caddy`
   ```sh
   sudo env PATH="$PATH" \
       serviceman add --system --cap-net-bind -- \
       caddy run --config ./Caddyfile
   ```
