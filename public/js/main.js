import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App.jsx";

ReactDOM.render(<App/>, document.querySelector("#app"));
/*import { Terminal } from "xterm";
import * as attach from "xterm/lib/addons/attach/attach";

Terminal.applyAddon(attach);

window.onload = () => {
  initTerminal();
};

function initTerminal() {
  console.log("Initialising terminal");
  const term = new Terminal();
  term.open(document.querySelector("#terminal"));
  term.setOption("cursorStyle", "block");

  const socket = new WebSocket(`ws://${location.host}/ws`);

  socket.onopen = () => {
    term.attach(socket);
  }
}*/