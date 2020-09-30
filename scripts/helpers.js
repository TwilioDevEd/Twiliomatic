const fs = require("fs");

const functionSettingsFile = fs.readFileSync(".twilio-functions");
const functionSettings = JSON.parse(functionSettingsFile);

const memoized = {};

async function getEnvironment(client, wantedEnv) {
  if (memoized.environment !== undefined) {
    return memoized.environment;
  }
  const environments = await client.serverless
    .services(functionSettings.serviceSid)
    .environments.list();
  if (wantedEnv.startsWith("prod")) {
    wantedEnv = null;
  }
  const environment = environments.find(
    (env) => env.domainSuffix === wantedEnv
  );
  memoized.environment = environment;
  return environment;
}

async function getFunctionDomain(client, env) {
  if (memoized.domain !== undefined) {
    return memoized.domain;
  }
  try {
    const environment = await getEnvironment(client, env);
    memoized.domain = environment.domain;
    return environment.domainName;
  } catch (err) {
    console.error(
      `Uh oh... Problem finding the domain for the environment named ${env}.`
    );
    console.error(err);
  }
}

async function setEnvironmentVariable(client, env, key, value) {
  const environment = await getEnvironment(client, env);
  const variables = await client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();
  const variable = variables.find((envVar) => envVar.key === key);
  if (variable !== undefined) {
    variable.update({ value });
    console.log(`Updated existing "${key}" to "${value}"`);
  } else {
    await client.serverless
      .services(environment.serviceSid)
      .environments(environment.sid)
      .variables.create({ key, value });
      console.log(`Created new "${key}" and set it to "${value}"`);
  }
  return true;
}

module.exports = {
  getEnvironment,
  getFunctionDomain,
  setEnvironmentVariable,
};
