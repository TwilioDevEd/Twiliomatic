const { Octokit } = require("@octokit/rest");
const axios = require("axios");

async function createGist(context, query, results) {
  try {
    const octokit = new Octokit({ auth: context.GITHUB_API_KEY });
    files = {};
    files[`incoming.${results.type}.twiml.xml`] = {
      content: results.twiml,
      type: "text/xml",
    };
    const response = await octokit.gists.create({
      description: `Twiliomatic: ${query}`,
      public: true,
      files,
    });
    return response.data.id;
  } catch(err) {
    console.error(err);
    throw err;
  }
}

async function readGist(context, gistId) {
  const prefix = `https://gist.github.com/${context.GITHUB_USER}/${gistId}`;
  const result = await axios.get(`${prefix}.json`);
  const query = result.data.description.replace("Twiliomatic: ", "");
  // incoming.VoiceResponse.twiml.xml
  const type = result.data.files[0].split(".")[1];
  const html = result.data.div;
  const regex = new RegExp(`(${prefix}/raw/[^"]+)`, "gm");
  const rawUrl = html.match(regex)[0];
  const twimlResponse = await axios.get(rawUrl);
  return {
    twiml: twimlResponse.data,
    query,
    type,
    gistId,
  };
}

module.exports = {
  createGist,
  readGist,
};
