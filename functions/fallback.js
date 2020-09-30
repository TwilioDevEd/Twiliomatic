exports.handler = (context, event, callback) => {
  console.log("Falling back");
  // Plain text will be returned as a <Say> if Voice and a <Message> if Messaging
  callback(null, "Whoops, guess we do need developers after all!");
};
