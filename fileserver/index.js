// Module Imports
const fastify = require('fastify');
const path = require('path');

// Configure our webserver
const app = fastify({ logger: false });

// Serve the static files directly under '/'
app.register(require('@fastify/static'), {
  root: path.join(__dirname, '../../dist'),
});

// Not found hook to catch all other requests and serve the main index.html
app.setNotFoundHandler((request, reply) => {
  return reply.sendFile('index.html');
});

// Run the server!
app.listen({ host: "0.0.0.0", port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server is now listening on ${address}`);
});