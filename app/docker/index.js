const Docker = require("dockerode");
const config = require("config");

const docker = new Docker({
  socketPath: config.docker.socketPath
});

const containers = {};

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

  if (!inputOptions.network) {
    options["NetworkDisabled"] = true;
  }

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
  output.containerId = container.id;

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
  }

  await container.start();
  console.log(`Started container image=${imageName} id=${container.id}`);

  return output;
}

async function stopService(id) {
  if (!(id in containers)) {
    throw new Error("Invalid container id");
  }

  if ("tty" in containers[id]) {
    // cleanup tty listeners
    containers[id].tty.end();
  }

  await containers[id].container.remove({ force: true });
  console.log(`Removed container id=${id}`);

  delete containers[id];
}

let exiting = false;
process.on("SIGINT", async () => {
  if (exiting) return;
  exiting = true;

  console.log("Terminating containers before exiting...");
  await Promise.all(
      Object.keys(containers).map((containerId) => stopContainer(containerId))
  );

  process.exit(0);
});

module.exports = {
  startService,
  stopService,
};
