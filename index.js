const Ev = require('geval/event')
const fs = require('fs')

// dummy request processing
const processRequest = (req, res) => {
  res.writeHead(200)
  res.end("All glory to WebSockets!\n")
}

const init = opts => {
  const weso = require('weso')(opts)
  const wsServer = require('ws').Server
  const server = (opts.secure
    ? require('https').createServer({
        key: fs.readFileSync(opts.secure.key),
        cert: fs.readFileSync(opts.secure.cert),
      }, processRequest)
    : require('http').createServer(processRequest))
    .listen(opts.port)

  const wss = new wsServer({ server })

  const open = Ev()
  const close = Ev()
  const error = Ev()

  wss.on('connection', ws => {
    // Foward message send by weso
    const clear = weso.listen(content => ws.send(content))

    const handshake = data => {
      if (data && data.indexOf('handshake:') === 0) {
        ws.id = data.slice(10)

        // Now that we have our id, trigger the open broadcast
        open.broadcast(ws)

        // Foward message send to weso
        ws.removeListener('message', handshake)
        ws.on('message', data => weso.onmessage(data, ws))
      }
    }

    ws.on('message', handshake)

    ws.ws = ws
    const wsObj = { ws }
    const assignWs = val => Object.assign(val || {}, wsObj)

    // Foward errors
    ws.on('error', err => error.broadcast(assignWs(err)))

    // Cleanup on socket close
    ws.on('close', ev => {
      close.broadcast(assignWs(ev))
      clear()
    })
  })

  weso.on = {
    open: open.listen,
    close: close.listen,
    error: error.listen,
  }

  return weso
}

module.exports = init

/*
  options :

  url: (required, ex: 'host.domain.com')
  port: 7266 (default, optional)
  secure: {
    key: '/path/to/you/ssl.key',
    cert: '/path/to/you/ssl.crt'
  }

  + all weso options
*/
