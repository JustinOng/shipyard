import React from "react";
import ReactDOM from "react-dom";
import { DatePicker, message } from "antd";
import "antd/dist/antd.css";

import Terminal from "./Terminal.jsx";
import "xterm/dist/xterm.css";
import "xterm/dist/xterm.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      date: null
    };
  }

  handleChange(date) {
    message.info(`Selected Date: ${date ? date.format("YYYY-MM-DD") : "None"}`);
    this.setState({ date });
  };

  render() {
    const { date } = this.state;
    return (
      <Terminal imageName="missingls"/>
    );
  }
}

export default App;