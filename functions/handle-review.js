const assets = Runtime.getAssets();
const { getRequest } = require(assets["/request.js"].path);

exports.handler = async function (context, event, callback) {
  const id = event.ContentId;
  if (id === undefined) {
    return callback(new Error(`Couldn't find request with id: ${id}`));
  } else {
    const request = await getRequest(context, id);
    const data = request.data;
    if (event.ReviewerResultTags.no === "True") {
      data.status = "error";
      data.error = "Sorry we couldn't find any acceptable TwiML.";
    } else {
      data.status = "moderated";
    }
    await request.update({ data });
    return callback(null, { id });
  }
};
