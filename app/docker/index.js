const Docker = require("dockerode");
const config = require("config");

const docker = new Docker({
  socketPath: config.docker.socketPath
});

const containers = {};

async function startContainer() {
  const container = await docker.createContainer({
    Image: "test",
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    OpenStdin: true
  })

  const ttyStream = await container.attach({
    stream: true,
    stdin: true,
    stdout: true,
    stderr: true
  });

  await container.start();
  console.log(`Started container id=${container.id}`);

  containers[container.id] = {
    id: container.id,
    container,
    tty: ttyStream,
    logs: ""
  };

  ttyStream.on("data", (data) => {
    containers[container.id].logs += data;
  });

  return containers[container.id];
}

async function stopContainer(id) {
  if(!(id in containers)) {
    throw new Error("Invalid container id");
  }

  containers[id].tty.end();

  await containers[id].container.remove({ force: true });
  console.log(`Removed container id=${id}`);

  delete containers[id];
}

let exiting = false;
process.on("SIGINT", async () => {
  if (exiting) return;
  exiting = true;
  
  for (const container of Object.values(containers)) {
    console.log(`Terminating container id=${container.id}`);
    await container.container.remove({ force: true });
  }

  process.exit(0);
});

module.exports = {
  startContainer,
  stopContainer
}