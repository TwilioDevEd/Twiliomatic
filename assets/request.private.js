const AccessToken = require("twilio/lib/jwt/AccessToken");

async function createRequest(context, query, configJson) {
  const client = context.getTwilioClient();
  const doc = await client.sync
    .services(context.TWILIO_SYNC_SERVICE_SID)
    .documents.create({
      data: {
        status: "created",
        query,
        configJson,
      },
      ttl: 15 * 60,
    });
  return doc;
}

async function getRequest(context, id) {
  const client = context.getTwilioClient();
  const doc = await client.sync
    .services(context.TWILIO_SYNC_SERVICE_SID)
    .documents(id)
    .fetch();
  return doc;
}

async function createTokenForId(context, id) {
  console.log(`Generating token for ${id}`);
  const token = new AccessToken(
    context.ACCOUNT_SID,
    context.TWILIO_API_KEY,
    context.TWILIO_API_SECRET
  );
  const syncGrant = new AccessToken.SyncGrant({
    serviceSid: context.TWILIO_SYNC_SERVICE_SID,
  });
  token.addGrant(syncGrant);
  token.identity = id;
  return token.toJwt();
}

module.exports = {
  createRequest,
  getRequest,
  createTokenForId,
};
