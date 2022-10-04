"use strict";

let CorsProxy = exports;

let request = require("@root/request");

/** @typedef {import('http').IncomingMessage} IncomingMessage */
/** @typedef {import('http').ServerResponse} ServerResponse */
/** @typedef {import('http').RequestListener} RequestListener */

/**
 * @typedef CorsProxy
 * @prop {RequestListener} handler
 */

/**
 * Creates a CORS Proxy http.RequestListener
 * @param {Object} opts - options
 * @param {String} [opts.prefix] - api prefix, e.g. '/api/cors'
 * @param {Array<String>} opts.allowedHostnames - list of proxiable hostnames, e.g. [ "example.com", "example.org" ]
 * @returns {CorsProxy}
 */
CorsProxy.create = function (opts) {
  let prefix = opts.prefix || "/api/cors/";
  let prefixLen = prefix.length;
  let allowedHostnames = opts.allowedHostnames || [
    "example.com",
    "example.net",
    "example.org",
  ];

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns {Promise<void>}
   * @throws {Error}
   */
  async function handler(req, res) {
    // GET example.com /api/hello
    console.info(req.method, req.headers.host || "[no host]", req.url);
    if (!req.url?.startsWith(prefix)) {
      let err = new Error(
        `cors requests must be in the format of '${prefix}<hostname>/<path>[?params]', not '${req.url}'`,
      );
      //@ts-ignore
      err.status = 400;
      //@ts-ignore
      err.code = "E_PREFIX";
      throw err;
    }

    // /api/cors/x.y.z/path => x.y.z/path
    let hostUrl = req.url.slice(prefixLen);
    let pathStart = hostUrl.indexOf("/");
    if (-1 === pathStart) {
      pathStart = hostUrl.length;
    }
    let hostname = hostUrl.slice(0, pathStart);
    let path = hostUrl.slice(pathStart) || "/";

    if ("*" !== allowedHostnames[0]) {
      if (!allowedHostnames.includes(hostname)) {
        let err = new Error(`'${hostname}' is not one of the allowed domains`);
        //@ts-ignore
        err.code = "E_DOMAIN";
        //@ts-ignore
        err.status = 400;
        throw err;
      }
    }

    let host = req.headers.host || "*";
    res.setHeader("Access-Control-Allow-Origin", host);

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, PUT, PATCH, POST, DELETE",
    );

    if (req.headers["access-control-request-headers"]) {
      res.setHeader(
        "Access-Control-Allow-Headers",
        //@ts-ignore
        req.headers["access-control-request-headers"],
      );
    }

    if (req.method === "OPTIONS") {
      res.end();
      return;
    }

    let resp = await request({
      url: `https://${hostname}/${path}`,
      method: req.method,
      body: req,
      headers: { Authorization: req.headers["Authorization"] },
      stream: true,
    });

    resp.pipe(res);
  }

  /** @type {RequestListener} */
  async function wrapper(req, res) {
    await handler(req, res).catch(function (e) {
      let msg;
      res.setHeader("Content-Type", "application/json");
      if (!e.status || 500 === e.status) {
        e.status = 500;
        console.error(e);
        msg = "internal server error";
      }
      res.statusCode = e.status;
      res.end(
        JSON.stringify({
          success: false,
          code: e.code,
          error: {
            message: msg || e.message,
          },
        }),
      );
    });
  }

  return {
    handler: wrapper,
  };
};
