Not my work. Put here with the permission of the creator
See [here][https://www.npmjs.com/package/weso-node] for the original work
## weso-node

Simple and light weight websocket server for node:

for more details on the protocol, checkout [weso][https://www.npmjs.com/package/weso]


    `npm install weso-node`


### Usage example :

``` javascript
const weso = require('weso-node')

const server = weso({
  port: 7266,
  subscribe: [ 'test' ],
  publish: [
    'initApps',
    'appDown',
    'appUp',
  ]
})

// Send a beautiful message every seconds to all the clients
setInterval(() => server.appUp({
  message: 'yolo'
}), 1000)

// pass a function to handle what ever you want to do when the server send
// a message on the route 'test'
server.test(({ route, data, ws }) => {
  console.log(route, data, ws.id)

  // you can send message to one client specificly from the ws object
  ws.send('myRoute:"my custom message"')
})

server.on.error(err => console.log('error', err))
server.on.close(err => console.log('close', err))


```

### Shitty stuff :
You need to handle clients connections / pool and all that on your own.
I just give an ID, it's stored in the browser localStorage so that allow you to remember the user and stuff.

gl hf.