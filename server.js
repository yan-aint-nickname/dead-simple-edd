const http = require("http");

const port = 8081;
const host = 'localhost';

function requestListener(req, res) {
  res.writeHead(200);
  res.end("My first server!");
}

const server = http.createServer(requestListener);


server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
