import React from "react";

import Terminal from "../Terminal/Terminal.jsx";

class Challenge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  render() {
    console.log(this.props);
    return (
      <div>
        <Terminal challengeName={ this.props.challengeName }/>
      </div>
    );
  }
}

export default Challenge;
