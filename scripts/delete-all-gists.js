require("dotenv").load();
const { Octokit } = require("@octokit/rest");
const { paginateRest } = require("@octokit/plugin-paginate-rest");

const PaginatedOctokit = Octokit.plugin(paginateRest);

async function deleteAllGists(seriously) {
  const octokit = new PaginatedOctokit({ auth: process.env.GITHUB_API_KEY });
  const user = process.env.GITHUB_USER;
  let keepOnTrucking = true;
  for await (const response of octokit.paginate.iterator(
    "GET /users/:user/gists",
    { user }
  )) {
    for (const gist of response.data) {
      if (! seriously) {
        console.log(`Would have deleted ${user}'s gist: ${gist.id}`);
      } else {
        try {
          await octokit.request('DELETE /gists/{gist_id}', {
            gist_id: gist.id
          });
          console.log(`Deleted ${user}'s gist: ${gist.id}`);
        } catch (err) {
          console.error(err);
          keepOnTrucking = false;
          break;
        }
      }
    }
    if (!keepOnTrucking) {
      console.log("Exiting pagination loop.");
      break;
    }
  }
}

const seriously = process.env.npm_config_seriously;
if (seriously === undefined) {
  console.warn("Not running seriously. Pass --seriously=true as a flag to do it, seriously.");
}

deleteAllGists(seriously)
  .then((result) => console.log(result))
  .catch((err) => console.error(err));
