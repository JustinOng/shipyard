const path = require("path");
const config = require("config");

const configVal = require(path.join(config.challenges.directory, "challenges.json"));

// full contains well, all the challenges
const full = {};
// sanitised excludes information that clients shoudnt see
const sanitised = {};
// challenges contains just the challenges with no category info
const challenges = {};

for (const category of configVal.categories) {
  full[category.name] = JSON.parse(JSON.stringify(category));
  sanitised[category.name] = JSON.parse(JSON.stringify(category));

  for (const challenge of sanitised[category.name].challenges) {
    challenges[challenge.name] = { ...challenge };
    for (const key of Object.keys(challenge)) {
      if (["services", "entryPoint"].indexOf(key) > -1) {
        delete challenge[key];
      }
    }
  }
}

module.exports = {
  full, sanitised, challenges
};
