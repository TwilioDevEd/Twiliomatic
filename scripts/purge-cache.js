require("dotenv").load();
const Cloudflare = require("cloudflare");

cf = Cloudflare({ token: process.env.CLOUDFLARE_API_TOKEN });
cf.zones
  .purgeCache(process.env.CLOUDFLARE_ZONE_ID, { purge_everything: true })
  .then((result) => {
    console.log("Success!", result);
  })
  .catch((err) => {
    console.error("Doh!", err);
  });
