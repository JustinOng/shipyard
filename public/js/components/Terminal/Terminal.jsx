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

  setupTerminal() {
    const { challengeName } = this.props;

    this.term = new Xterm();
    this.term.open(this.container);
    this.term.setOption("cursorStyle", "block");

    this.socket = new WebSocket(`ws://${location.host}/${challengeName}`);

    console.log(`Opening socket for image ${challengeName}`);
    this.socket.addEventListener("open", () => {
      console.log("Socket opened");
      this.term.attach(this.socket);
    });

    this.socket.addEventListener("close", () => {
      console.warn(`Socket url=${this.socket.url} closed`);
    });
  }

  destroyTerminal() {
    return new Promise((resolve) => {
      if (this.term) {
        this.term.destroy();
        this.term = null;
      }

      console.warn(`Closing socket url=${this.socket.url}`);
      this.socket.close();
      this.socket.addEventListener("close", resolve);
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.challengeName !== prevProps.challengeName) {
      console.log("Change in challenge, reattaching terminal");
      this.destroyTerminal().then(() => {
        this.setupTerminal();
      });
    }
  }

  componentDidMount() {
    this.setupTerminal();
    window.term = this.term;
  }

  componentWillUnmount() {
    console.log("Terminal unmounting");
    this.destroyTerminal();
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.challengeName !== nextProps.challengeName) return true;
    return false;
  }

  render() {
    return <div ref={(ref) => {
      this.container = ref;
    }}/>;
  }
}

export default Terminal;
