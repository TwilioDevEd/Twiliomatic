/**
 * Makes use of Sync to allow for a long running query, one that might involve human content moderation.
 * @param {*} config - Options to include. See /requester
 * @param {*} query - The Twiliomatic query, eg. Create an app that says Hello World
 */

function longQuery(config, query) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const properties = config || {};
    fetch("requester", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        Query: query,
        Config: JSON.stringify(config),
      }).toString(),
    }).then((response) => {
      response.json().then((json) => {
        //console.dir(json);
        try {
          const syncClient = new Twilio.Sync.Client(json.token);
          syncClient.document(json.id).then((doc) => {
            //console.log(`Watching doc ${json.id}`);
            function nextStep() {
              return fetch("/requester", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `Id=${json.id}&counter=${++counter}`,
              })
                .then((step) => {
                  if (!step.ok) {
                    console.log(`Got error ${step.statusText}`);
                    console.log("Trying again...");
                    if (counter > 15) {
                      throw new Error("Maximum retries reached");
                    }
                    // Recurse, what could go wrong?
                    nextStep();
                  }
                  step.json().then((stepJson) => {
                    if (stepJson.status === "error") {
                      reject(new Error(stepJson.errorMessage));
                    }
                  });
                })
                .catch((err) => {
                  console.error(err);
                  console.log("Exiting...");
                  reject(err);
                });
            }
            doc.on("updated", (data) => {
              console.dir(data);
              if (data.value.status === "complete") {
                resolve(data.value);
              } else {
                if (config.onStatusChange) {
                  config.onStatusChange(data.value.status);
                }
                // Continue
                console.log("Continuing...");
                nextStep();
              }
            });
            // Kick things off
            nextStep();
          });
        } catch (err) {
          console.error(err);
          reject(err);
        }
      });
    });
  });
}
