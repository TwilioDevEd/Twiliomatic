require("dotenv").load();
const fs = require("fs");
const Client = require("twilio");

const { setEnvironmentVariable } = require("./helpers");

const gists = process.env.npm_config_gists;
const env = process.env.npm_config_env;

if (!gists || !env) {
  console.log(`Usage: npm run set-favorites --gists=ABC123,DEF456,QAB321 --env=production`);
  console.log(`Separate gist ids from ${process.env.GITHUB_USER_NAME} with a comma`);
  process.exit(0);
}
const client = new Client(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
setEnvironmentVariable(client, env, "FAVORITE_GIST_IDS", gists)
  .then((result) => {
    console.log(result);
  })
  .catch((err) => console.error(err));
