import React from "react";
import { Terminal as Xterm } from "xterm";

import "xterm/dist/xterm.css";
import "xterm/dist/xterm.js";
import "./Terminal.css";

import * as attach from "xterm/lib/addons/attach/attach";

// built with reference to
// https://github.com/farfromrefug/react-xterm/blob/master/src/react-xterm.tsx

Xterm.applyAddon(attach);

class Terminal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.term = new Xterm();
    this.term.open(this.container);
    this.term.setOption("cursorStyle", "block");

    this.socket = new WebSocket(`ws://${location.host}/${this.props.challengeName}`);

    console.log(`Opening socket for image ${this.props.challengeName}`);
    this.socket.onopen = () => {
      console.log("Socket opened");
      this.term.attach(this.socket);
    };

    this.socket.onclose = () => {
      console.warn("Socket closed");
    };
  }

  componentWillUnmount() {
    if (this.term) {
      this.term.destroy();
      this.term = null;
    }

    // check if ws is not CLOSING or CLOSED
    // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
    if (this.socket.readyState < 2) {
      console.log("Terminal component being unmounted, closing socket");
      this.socket.close();
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div ref={(ref) => {
      this.container = ref;
    }}/>;
  }
}

export default Terminal;
