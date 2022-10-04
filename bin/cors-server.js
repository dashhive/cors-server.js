#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secret" });

let Http = require("http");

let CorsProxy = require("../");

async function main() {
  let PORT = 2677; // 2(C) 6(O) 77(RS)
  let portIndex = process.argv.indexOf("--port");
  if (portIndex > 0) {
    PORT = parseInt(process.argv[portIndex + 1], 10) || PORT;
  } else {
    PORT =
      parseInt(process.env.NODE_PORT || process.env.PORT || "", 10) || PORT;
  }

  let prefix;
  let prefixIndex = process.argv.indexOf("--prefix");
  if (prefixIndex > 0) {
    prefix = process.argv[prefixIndex + 1];
  } else {
    prefix = process.env.CORS_PROXY_PREFIX;
  }

  let allowedHostnamesStr;
  let domainsIndex = process.argv.indexOf("--domains");
  if (domainsIndex > 0) {
    allowedHostnamesStr = process.argv[domainsIndex + 1];
  } else {
    allowedHostnamesStr = process.env.CORS_ALLOWED_DOMAINS;
  }
  let allowedHostnames = allowedHostnamesStr?.split(/[\s,]+/g) || [];
  if (!allowedHostnames.length) {
    console.error("please set CORS_ALLOWED_HOSTNAMES or --domains");
    return;
  }

  console.info("Prefix:", prefix);
  console.info("Allowed Domains:", allowedHostnames.join(", "));

  let corsProxy = CorsProxy.create({
    prefix,
    allowedHostnames,
  });

  let server = Http.createServer(corsProxy.handler);
  server.listen(PORT, function () {
    console.info(`CORS Proxy listening on`, server.address());
  });
}

main().catch(function (err) {
  console.error("Fail:");
  console.error(err.stack || err);
  process.exit(1);
});
