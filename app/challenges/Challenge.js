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
    this.console = challenge.console;

    this.networks = {};
    this.services = [];

    this.serviceConfig = challenge.services;
    this.networkConfig = challenge.networks;
  }

  async start() {
    const output = {};

    if (this.networkConfig && this.networkConfig.length) {
      const networks = await Promise.all(this.networkConfig.map((network) => {
        return docker.createNetwork(`${network.name}-${this.id}`, network.options);
      }));

      this.networks = {};
      for (const network of networks) {
        this.networks[network.name] = network;
      }
    } else {
      this.networks = {};
    }

    this.services = await Promise.all(this.serviceConfig.map((service) => {
      const options = {
        networks: service.networks
      };

      if (this.console && service.name === this.console) {
        options["attach"] = true;
      }

      return docker.startService(service.name, options).then((data) => {
        Object.assign(service, data);
        return service;
      });
    }));

    for (const service of this.services) {
      if (this.console && service.tty) {
        this.tty = service.tty;
        output.tty = this.tty;
      }

      if (service.networks) {
        for (const network of service.networks) {
          const fullNetworkName = `${network}-${this.id}`;
          if (!(fullNetworkName in this.networks)) {
            console.warn(`Unable to find network ${network}`);
            continue;
          }

          await docker.connect(service.id, this.networks[fullNetworkName].id);
        }
      }
    }

    return output;
  }

  async stop() {
    await Promise.all(this.services.map(({ id }) => docker.stopService(id)));
    await Promise.all(Object.values(this.networks).map(({ id }) => docker.removeNetwork(id)));
  }
};

module.exports = Challenge;
