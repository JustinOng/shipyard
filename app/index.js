const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const express = require("express");
const docker = require("./docker");
const config = require("config");

const app = express();

app.use("/xterm", express.static(path.join(__dirname, "../node_modules/xterm/dist/")));
app.use("/", express.static(path.join(__dirname, "../dist"), {
  index: "index.html"
}));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", async (ws, req) => {
  // placeholder for image whitelisting
  if (req.url !== "/missingls") {
    ws.close();
    return;
  }

  const container = await docker.startContainer(req.url.substring(1));

  // send data that was already transmitted before this socket
  // was opened
  ws.send(container.logs);

  // bind data from terminal to websocket
  function ttyListener(data) {
    ws.send(data.toString("utf8"));
  }

  container.tty.on("data", ttyListener);

  // bind data from websocket to terminal
  ws.on("message", (msg) => {
    container.tty.write(msg)
  });

  ws.on("close", () => {
    docker.stopContainer(container.id);
    container.tty.removeListener("data", ttyListener);
  });
});

server.listen(config.httpserver.port, () => {
  console.log(`HTTP server listening on ${config.httpserver.port}`);
});