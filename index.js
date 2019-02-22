const Docker = require("dockerode");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

docker.run("test", ["ls"], process.stdout).then((container) => {
  return container.remove();
}).then((data) => {
  console.log(`Container removed: ${data}`);
}).catch((err) => {
  console.log(err);
})