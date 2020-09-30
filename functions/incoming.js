const { readGist } = require(Runtime.getAssets()["/gist.js"].path);

exports.handler = async function (context, event, callback) {
  let twiml;
  if (event.Twiml) {
    twiml = event.Twiml;
  } else if (event.GistId) {
    try {
      console.log("Attempting to read gist");
      const twimlResponse = await readGist(context, event.GistId);
      twiml = twimlResponse.twiml;
      
    } catch(err) {
      console.error(`Problem reading gist ${err}`);
    }
  }
  console.log(`Twiml: ${twiml}`);
  try {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'text/xml');
    response.setBody(twiml);
    callback(null, response);
  } catch (err) {
    console.error(`Uh oh. ${err}`);
    callback(err);
  }
};
