const assets = Runtime.getAssets();
const { render, errorHandler } = require(assets["/templates.js"].path);
const { readGist } = require(assets["/gist.js"].path);

let cachedFavorites;

function isCacheValid(favoriteIds) {
  if (cachedFavorites === undefined) {
    return false;
  }
  if (cachedFavorites.length !== favoriteIds.length) {
    return false;
  }
  for (let i = 0; i < cachedFavorites.length; i++) {
    if (cachedFavorites[i].gistId !== favoriteIds[i]) {
      return false;
    }
  }
  return true;
}

async function getFavorites(context) {
  const favoriteGistIdsString = context.FAVORITE_GIST_IDS;
  if (favoriteGistIdsString) {
    const favoriteGistIds = favoriteGistIdsString.split(",");
    if (isCacheValid(favoriteGistIds)) {
      return cachedFavorites;
    }
    const promises = favoriteGistIds.map(id => {
      return readGist(context, id)
        .catch(err => {
          console.error(`Error reading gist: ${err}`);
        });
    });
    const results = await Promise.all(promises);
    // Ignore any fails
    cachedFavorites = results.filter(fave => fave !== undefined);
    return cachedFavorites;
  }
}

exports.handler = async (context, event, callback) => {
  if (context.MODE === "shutdown") {
    const favorites = await getFavorites(context);
    callback(null, render(context, { favorites }, "/shutdown"));
  } else {
    callback(null, render(context, {}));
  }
};
