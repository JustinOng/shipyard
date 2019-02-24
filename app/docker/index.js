const Docker = require("dockerode");
const config = require("config");

const docker = new Docker({
  socketPath: config.docker.socketPath
});

// retrieve id of the builtin"none" network for later removal from containers
const networkNonePromise = docker.listNetworks({
  driver: "null",
  name: "none",
  type: "builtin"
}).then((networks) => {
  // filter because the query seems to return all networks sometimes?!
  networks = networks.filter((network) => network.Name === "none");
  const id = networks[0].Id;

  console.log(`Found network none id=${id}`);
  return docker.getNetwork(id);
});

const containers = {};
const networks = {};

async function startService(imageName, inputOptions) {
  /*
    input:
    imageName: name of image
    options: {
      network: [<network name>] | falsey
      attach: true | false // whether to attach and return a ttyStream
    }
    output:
    {
      containerId,
      tty (if attach option was set)
    }
  */

  const options = { Image: imageName };
  const output = {};

  //if (!inputOptions.networks) {
  // horrible hack:
  // assign the none network so the container is not joined
  // to the default bridge network when created.
  // this none network is later removed because the container
  // cannot join other networks when its connected to none
  options["HostConfig"] = {
    "NetworkMode": "none"
  };

  if (inputOptions.attach) {
    Object.assign(options, {
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      OpenStdin: true
    });
  }

  const container = await docker.createContainer(options);
  output.id = container.id;

  containers[container.id] = {
    id: container.id,
    container
  };

  if (inputOptions.attach) {
    const ttyStream = await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true
    });

    containers[container.id].tty = ttyStream;
    containers[container.id].logs = "";

    // hook the newListener event to send past data
    // when a new data listener is attached

    ttyStream.on("newListener", (eventName, listener) => {
      if (eventName !== "data") return;

      listener(containers[container.id].logs);
    });

    ttyStream.on("data", (data) => {
      containers[container.id].logs += data;
    });

    containers[container.id].tty = ttyStream;
    output.tty = ttyStream;
    console.log(`Attaching tty stream to id=${container.id}`);
  }

  await container.start();
  console.log(`Started container image=${imageName} id=${container.id}`);

  // part of the horrible hack from above to prevent
  // docker from attaching the default bridge network
  // but only remove none if the container does have networks
  if (inputOptions.networks) {
    const networkNone = await networkNonePromise;
    await networkNone.disconnect({ Container: container.id });
  }

  return output;
}

async function stopService(id) {
  if (!(id in containers)) {
    throw new Error("Unknown container id");
  }

  if ("tty" in containers[id]) {
    // cleanup tty listeners
    containers[id].tty.end();
  }

  await containers[id].container.remove({ force: true });
  console.log(`Removed container id=${id}`);

  delete containers[id];
}

async function createNetwork(name, inputOptions) {
  const options = {};
  Object.assign(options, { Name: name }, inputOptions);

  const network = await docker.createNetwork(options);
  console.log(`Created network name=${name} id=${network.id}`);

  networks[network.id] = network;

  return { name, id: network.id };
}

async function removeNetwork(id) {
  if (!(id in networks)) {
    throw new Error("Unknown network id");
  }

  await networks[id].remove();
  console.log(`Removed network id=${id}`);

  delete networks[id];
}

async function connect(containerId, networkId) {
  if (!(networkId in networks)) {
    throw new Error("Unknown network id");
  }

  if (!(containerId in containers)) {
    throw new Error("Unknown container id");
  }

  await networks[networkId].connect({ Container: containerId });
  console.log(`Connected container id=${containerId} to network id=${networkId}`);
}

let exiting = false;
process.on("SIGINT", async () => {
  if (exiting) return;
  exiting = true;

  console.log("Terminating containers before exiting...");
  await Promise.all(Object.keys(containers).map((id) => stopService(id)));
  await Promise.all(Object.keys(networks).map((id) => removeNetwork(id)));

  process.exit(0);
});

module.exports = {
  startService,
  stopService,
  createNetwork,
  removeNetwork,
  connect
};
