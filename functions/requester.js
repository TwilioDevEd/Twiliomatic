const assets = Runtime.getAssets();
const { createRequest, getRequest, createTokenForId } = require(assets[
  "/request.js"
].path);
const { generateAllTwiml } = require(Runtime.getAssets()["/twiml-generator.js"]
  .path);
const { createGist } = require(assets["/gist.js"].path);

const {
  createReview,
  screenAllTwiml,
  screenText,
  chooseModeratedTwiml,
} = require(assets["/content-moderator.js"].path);

exports.handler = async (context, event, callback) => {
  const id = event.Id;
  let request;
  let query;
  try {
    if (!id) {
      query = event.Query;
      if (!query) {
        throw new Error("Either Id or Query is required");
      }
      const configJson = event.Config || JSON.stringify({});
      request = await createRequest(context, query, configJson);
      const token = await createTokenForId(context, request.sid);
      let status = "created";
      const config = JSON.parse(configJson);
      console.dir(config);
      if (config.ModerateQuery) {
        status = "query-moderation-requested";
        request.data.status = status;
        await request.update({ data: request.data });
      }
      return callback(null, {
        id: request.sid,
        token,
        status,
      });
    } else {
      request = await getRequest(context, id);
      const payload = { id };
      const data = request.data;
      const config = JSON.parse(data.configJson);
      let handled = true;
      switch (data.status) {
        case "query-moderation-requested":
          console.log("Moderating query");
          const queryModeration = await screenText(context, data.query);
          if (queryModeration.result === "fail") {
            throw new Error(`No acceptable TwiML was found for that query`);
          }
          data.status = "created";
          break;
        case "created":
          console.log(`Generating TwiML for "${data.query}"`);
          data.twimls = await generateAllTwiml(context, data.query);
          // TODO: If there are TwiMLs
          data.status = "generated";
          break;
        case "generated":
          console.log("Moderating TwiMLs");
          // Modifies twimls in place
          await screenAllTwiml(context, data.query, data.twimls);
          // Choose "best bet" twiml (either passed moderation, or requires review)
          data.twiml = chooseModeratedTwiml(data.twimls);
          if (!data.twiml) {
            throw new Error(`No acceptable TwiML was found`);
          }
          // NOTE: change this to run the flow no matter what
          if (context.MODE === "human-moderate-everything") {
            data.twiml.moderation.result = "reviewRequired";
          }
          if (data.twiml.moderation.result === "pass") {
            data.status = "moderated";
          } else if (data.twiml.moderation.result === "reviewRequired") {
            // HACK: Overwrite context.DOMAIN_NAME to ensure that local tunnel domain is accessible for the
            // content moderation callbackUrl
            if (
              context.DOMAIN_NAME.startsWith("localhost") &&
              config.hostName
            ) {
              context.DOMAIN_NAME = config.hostName;
            }
            await createReview(context, data.query, data.twiml, id);
            data.status = "in-review";
          }
          break;
        case "moderated":
          payload.twiml = data.twiml.twiml;
          if (config.PostToGitHub) {
            data.status = "github-posting";
          } else {
            data.status = "complete";
          }
          break;
        case "github-posting":
          data.gistId = await createGist(context, data.query, data.twiml);
          data.status = "complete";
          break;
        case "error":
          throw new Error(data.error);
        default:
          console.warn(`No handler found for ${data.status}`);
          handled = false;
      }
      if (handled) {
        await request.update({ data });
      }
      payload.status = data.status;
      return callback(null, payload);
    }
  } catch (err) {
    console.error(`Error encountered: ${err}.`);
    return callback(null, { status: "error", errorMessage: err.message });
  }
};
