const he = require("he");
const ContentModeratorClient = require("@azure/cognitiveservices-contentmoderator")
  .ContentModeratorClient;
const CognitiveServicesCredentials = require("@azure/ms-rest-azure-js")
  .CognitiveServicesCredentials;

// Process a list of twiml + metadata objects and screen each item through content moderation.
// Modifies 'twimls' in place to add a "moderation" property, see screenText for property schema
function screenAllTwiml(context, query, twimls) {
  const promises = twimls.map((twiml) => {
    return screenText(context, twiml.twiml).then((moderation) => {
      twiml.moderation = moderation;
    });
  });
  return Promise.all(promises).catch((err) => {
    throw err;
  });
}

// Screen text and return a contentModeration object containing info about the moderation results
// moderation = {
//   result: "pass", "fail", or "reviewRequired",
// }
function screenText(context, text) {
  const cognitiveServiceCredentials = new CognitiveServicesCredentials(
    context.AZURE_CONTENT_MODERATOR_KEY
  );
  const client = new ContentModeratorClient(
    cognitiveServiceCredentials,
    context.AZURE_CONTENT_MODERATOR_ENDPOINT
  );

  return new Promise((resolve, reject) => {
    client.textModeration
      .screenText("text/plain", text, {
        classify: true,
        language: "eng",
      })
      .then((output) => {
        if (output.terms) {
          return resolve({result: "fail"});
        } else if (output.classification.reviewRecommended) {
          return resolve({result: "reviewRequired"});
        } else {
          return resolve({result: "pass"});
        }
      })
      .catch((err) => {
        return reject(new Error(`Error during content moderation: ${err}`));
      });
  });
}

// Choose "best bet" twiml from list of twiml + metadata objects
// "Best bet" means it is either the first thing that has explicitly passed moderation,
// or the first thing that requires human review. Will not return twiml that has "failed"
// automatic moderation.
function chooseModeratedTwiml(twimls) {
  for (let twiml of twimls) {
    if (twiml.moderation.result === "pass") {
      return twiml;
    }
  }
  for (let twiml of twimls) {
    if (twiml.moderation.result === "reviewRequired") {
      return twiml;
    }
  }
  return;
}

// Create a review in the Azure Content Moderation Review tool for a human to review
// Uses the 'syncSID' as a uniqueID to tag the review so that it can be identified when returned
// in the review callback.
// This function resolves when the review has been created. See '/handle-review' for the webhook handler
// for a completed review.
function createReview(context, query, twimlObj, syncSID) {
  const contentModeratorKey = context.AZURE_CONTENT_MODERATOR_KEY;
  const cognitiveServiceCredentials = new CognitiveServicesCredentials(
    contentModeratorKey
  );
  const client = new ContentModeratorClient(
    cognitiveServiceCredentials,
    context.AZURE_CONTENT_MODERATOR_ENDPOINT
  );

  return new Promise((resolve, reject) => {
    const contentType = "application/json";
    const teamName = "keynotetest";
    const reviewRequestBody = [
      {
        type: "Text",
        content: `${query}: ${he.encode(twimlObj.twiml)}`,
        contentId: syncSID,
        callbackEndpoint: `https://${context.DOMAIN_NAME}/handle-review`,
      },
    ];

    client.reviews
      .createReviews(contentType, teamName, reviewRequestBody)
      .then((output) => {
        return resolve(output);
      })
      .catch((err) => {
        return reject(new Error(`Error creating review: ${err}`));
      });
  });
}

module.exports = {
  screenAllTwiml,
  screenText,
  createReview,
  chooseModeratedTwiml,
};
