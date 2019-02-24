import React from "react";
import { Spin } from "antd";

import Terminal from "../Terminal/Terminal.jsx";

class Challenge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      terminalState: true
    };
  }

  onTerminalLoadingChange(terminalState) {
    console.log(terminalState);
    this.setState({ terminalState });
  }

  render() {
    return (
      <div>
        <Spin
          spinning={ this.state.terminalState !== "OPEN" }
          tip={ this.state.terminalState === "CLOSED" ? "Socket closed":"" }
        >
          <Terminal
            challengeName={ this.props.challengeName }
            onLoadingChange={ this.onTerminalLoadingChange.bind(this) }
          />
        </Spin>
      </div>
    );
  }
}

export default Challenge;
