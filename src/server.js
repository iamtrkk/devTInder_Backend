//Creating server without Express
const http = require("http");

const server = http.createServer(function (req, res) {
  if (req.url === "/trk") {
    //localhost:3000/trk
    res.end("Tarique");
  }
  res.end("Hello World");
});

server.listen(3000);
