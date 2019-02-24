const uuidv4 = require("uuid/v4");
const docker = require("../docker");
const { challenges } = require("./load.js");

class Challenge {
  constructor(challengeName) {
    if (!(challengeName in challenges)) {
      throw new Error(`Invalid challenge name provided: ${challengeName}`);
    }

    console.log(`Initialising challenge ${challengeName}`);

    const challenge = {};
    Object.assign(challenge, challenges[challengeName]);

    this.id = uuidv4();
    this.type = challenge.type;
    this.entryPoint = challenge.entryPoint;

    this.serviceConfig = challenge.services;
  }

  async start() {
    this.services = await Promise.all(this.serviceConfig.map((service) => {
      const options = {
        network: service.network
      };

      if (this.type === "console" && service.name === this.entryPoint) {
        options["attach"] = true;
      }

      return docker.startContainer(service.name, options);
    }));

    if (this.type === "console") {
      for (const service of this.services) {
        this.tty = service.tty;

        return { tty: this.tty };
      }
    }
  }

  async stop() {
    return Promise.all(this.services.map((service) => docker.stopContainer(service.containerId)));
  }
};

module.exports = Challenge;
