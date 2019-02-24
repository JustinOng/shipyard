const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const express = require("express");
const { sanitised: sanitisedChallenges, Challenge } = require("./challenges");
const config = require("config");

const app = express();

app.use("/", express.static(path.join(__dirname, "../dist")));

app.get("/challenges", (req, res) => {
  res.send(JSON.stringify(sanitisedChallenges));
});

app.get("*", (request, response) => {
  response.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", async (ws, req) => {
  const challengeName = req.url.substring(1);

  const challenge = new Challenge(challengeName);
  const data = await challenge.start();

  // if this challenge involves a console,
  // bind it to the websocket
  if (data.tty) {
    // bind data from the client to tty
    ws.on("message", (msg) => data.tty.write(msg));

    // bind data from tty to client
    data.tty.on("data", (msg) => ws.send(msg));
  }

  ws.on("close", () => {
    challenge.stop();
  });
});

server.listen(config.httpserver.port, () => {
  console.log(`HTTP server listening on ${config.httpserver.port}`);
});
