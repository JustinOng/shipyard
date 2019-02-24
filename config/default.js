const path = require("path");

module.exports = {
  "httpserver": {
    "port": 3000
  },
  "docker": {
    "socketPath": "/var/run/docker.sock"
  },
  "challenges": {
    "directory": path.resolve(__dirname, "../challenges")
  }
};
