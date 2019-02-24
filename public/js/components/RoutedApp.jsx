import React from "react";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

class RoutedApp extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    );
  }
}

export default RoutedApp;
