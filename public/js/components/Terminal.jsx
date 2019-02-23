import React from "react";
import ReactDOM from "react-dom";
import { Terminal as Xterm } from "xterm";
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
    this.term.open(document.querySelector("#terminal"));
    this.term.setOption("cursorStyle", "block");

    this.socket = new WebSocket(`ws://${location.host}/${this.props.imageName}`);

    console.log(`Opening socket for image ${this.props.imageName}`);
    this.socket.onopen = () => {
      console.log("Socket opened");
      this.term.attach(this.socket);
    }

    this.socket.onclose = () => {
      console.warn("Socket terminated by server");
    }
  }

  componentWillUnmount() {
    if (this.term) {
      this.term.destroy();
      this.term = null;
    }

    // check if ws is not CLOSING or CLOSED
    // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
    if (this.socket.readyState < 2) {
      this.socket.close();
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div ref={(ref) => {
      this.container = ref;
    }}/>
  }
}

export default Terminal;