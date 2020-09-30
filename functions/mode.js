exports.handler = (context, event, callback) => {
  const liveModes = ["keynote", "recording", "human-moderate-everything"];
  callback(null, {
    mode: context.MODE,
    enabled: liveModes.includes(context.MODE),
  });
};
