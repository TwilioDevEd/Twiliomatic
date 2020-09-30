const assets = Runtime.getAssets();
const { getRequest } = require(assets["/request.js"].path);
const { render } = require(assets["/templates.js"].path);

exports.handler = async (context, event, callback) => {
  let err = event.Error;
  const id = event.id;
  if (id) {
    const request = await getRequest(context, id);
    err = request.data.error;
  }
  callback(null, render(context, {err}));
};
