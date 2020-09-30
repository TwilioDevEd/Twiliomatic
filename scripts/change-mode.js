require("dotenv").load();
const fs = require("fs");
const Client = require("twilio");

const { setEnvironmentVariable } = require("./helpers");

const mode = process.env.npm_config_mode;
const env = process.env.npm_config_env;

if (!mode || !env) {
  console.log(`Usage: npm run change-mode --mode=keynote --env=production`);
  process.exit(0);
}
const client = new Client(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
setEnvironmentVariable(client, env, "MODE", mode)
  .then((result) => {
    console.log(result);
  })
  .catch((err) => console.error(err));
