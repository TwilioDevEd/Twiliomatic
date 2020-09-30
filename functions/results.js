const assets = Runtime.getAssets();

const { render, errorHandler } = require(assets["/templates.js"].path);
const { readGist } = require(assets["/gist.js"].path);

exports.handler = async (context, event, callback) => {
  const gistId = event.GistId;
  try {
    const results = await readGist(context, gistId);
    callback(null, render(context, {results, gistId}));
  } catch(err) {
    errorHandler(context, err, callback);
  }
};
