const assets = Runtime.getAssets();
const { render, errorHandler } = require(assets["/templates.js"].path);

exports.handler = async (context, event, callback) => {
    callback(null, render(context, { query: event.Query }));
};
