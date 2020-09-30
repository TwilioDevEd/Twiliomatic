const fs = require("fs");
const OpenAI = require("openai-api");
const formatter = require("xml-formatter");
const assets = Runtime.getAssets();
const determineTwimlType = require(assets["/twiml-validator.js"].path);

const twimlSampleFile = assets["/twiml-prompts.txt"].path;
const twimlSamples = fs.readFileSync(twimlSampleFile).toString("utf-8");

async function generateResponses(context, query) {
  const prompt = twimlSamples + query + "\n";
  const openAI = new OpenAI(context.OPEN_API_KEY);

  const response = await openAI.complete({
    prompt,
    stop: "\n",
    maxTokens: 512,
    n: 5,
  });

  return response.data.choices.map((choice) => choice.text.replace("A: ", ""));
}

function twimlPayload(twiml) {
  // This throws on error
  const type = determineTwimlType(twiml);
  return {
    twiml: _cleanAndFormatTwiml(twiml),
    type
  };
}

// Returns all valid TwiML response formatted and typed
async function generateAllTwiml(context, query) {
  const results = await generateResponses(context, query);
  // Unique results
  const twimls = [...new Set(results)].map((result) => {
    try {
      return twimlPayload(result);
    } catch (err) {
      console.log(`Continuing after error: ${err}`);
      return;
    }
  });
  return twimls.filter((twiml) => twiml !== undefined);
}

function _cleanAndFormatTwiml(twiml) {
  const phoneNumberRegExp = new RegExp(
    // RegExp to detect phone numbers taken from: https://gist.github.com/maguay/f3a46f578568a608413530e27b78af88
    // Detects 7-10 digit phone numbers between <Dial></Dial> or <Dial><Number> tags to avoid calling up a random number
    /(<Dial.*>(?:<Number.*>)?)(?:(?:\+?([1-9]|[0-9][0-9]|[0-9][0-9][0-9])\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([0-9][1-9]|[0-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?((?:<\/Number>)?<\/Dial>)/,
    "gm"
  );
  // Replace any phone number between `<Dial>` tags with '555-555-1234', retaining the outer tags
  return formatter(twiml.replace(phoneNumberRegExp, "$1555-555-1234$8"));
}

module.exports = {
  generateAllTwiml
};
