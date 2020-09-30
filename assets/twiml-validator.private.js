/**
 * Due to timing, platform, and the basic nature of this app, we do not use an XSD to validate the TwiML
 * We quickly validate that the TwiML looks "sort of" correct.
 * Do not do this at home ;)
 */

require("string.prototype.matchall").shim();

const voiceTags = [
  "Dial",
  "Client",
  "Number",
  "Conference",
  "Sim",
  "Sip",
  "Autopilot",
  "Echo",
  "Enqueue",
  "Gather",
  "Hangup",
  "Leave",
  "Pause",
  "Play",
  "Queue",
  "Record",
  "Redirect",
  "Reject",
  "Say",
  "Sms",
  "Pay",
  "Prompt",
  "Start",
  "Stop",
  "Refer",
  "Siprec",
  "Stream",
];
const messagingTags = ["Message", "Redirect"];

function determineTwimlType(twiml) {
  const tagsMatch = twiml.matchAll(/<(\w+)[^\>]*>/gm);
  // Starts with Response
  const tags = Array.from(tagsMatch).map((matched) => matched[1]);
  if (tags.length <= 1 || tags[0] !== "Response") {
    throw new Error(`Invalid TwiML (Did not start with <Response>): ${twiml}`);
  }
  // Lose the <Response> tag
  tags.shift();
  const isVoice = tags.every((tag) => voiceTags.includes(tag));
  const isMessaging = tags.every((tag) => messagingTags.includes(tag));
  if (isVoice) {
    return "VoiceResponse";
  }
  if (isMessaging) {
    return "MessagingResponse";
  }
  throw new Error(`Invalid TwiML (unknown or mismatched tags): ${twiml}`);
}

module.exports = determineTwimlType;
