# Twiliomatic

A TwiML generator using GPT-3 from OpenAI

## Setup

* [Install Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart)

```bash
brew tap twilio/brew && brew install twilio
```

* [Install Twilio Serverless Plugin](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started#install-the-twilio-serverless-toolkit)

```bash
twilio plugins:install @twilio-labs/plugin-serverless
```

Setup your environment

From the root of your repository

```bash
npm install
npx configure-env
```

Develop locally

```bash
twilio serverless:start
```

Deploy to dev

```bash
twilio serverless:deploy
```

Deploy to prod

```bash
twilio serverless:deploy --production
```

The main interface **currently** lives at `/index.html`

Use the output from your deploys to locate the full url.

It will look something like:

```bash
https://twiliomatic-9999-dev.twil.io/index.html
```

Where 9999 is unique to your deploy and environment.

## Scripts

### change-mode

Provides the ability to change modes by environment. `keynote` for when it airs. `recording` for when it's being recorded. See `/mode` and it is dropped on the body tag CSS wise

```bash
npm run change-mode --mode=keynote --env=production
```

```bash
npm run change-mode --mode=shutdown --env=dev
```

### set-favorites

Update the `shutdown` mode favorites. Value is comma separated

```bash
npm run set-favorites --gists=ABC123,DEF456 --env=production
```

### delete-all-gists

Removes all gists for the `GITHUB_USER`

```bash
npm run delete-all-gists
```

### purge-cache

Purges cache for Cloudflare Zone `CLOUDFLARE_ZONE_ID`

```bash
npm run purge-cache
```

## Overview

The OpenAI prompts are defined in [twiml-prompts](assets/twiml-prompts.private.txt)

**/mode**

Returns an object that helps to detect the current state of things

```json
{
  "mode": "keynote",
  "enabled": true
}
```

**/requester**

Allows for a long running query through the use of Sync.


| Parameter | Description |
| --------- | ----------- |
| Query | (Required intiially) The prompt you'd like to complete|
| ID | The ID of the request delivered after the initial Query is ran|

See client side [long-query.js](./assets/long-query.js) and it's [usage](./assets/templates/processing.private.hbs)

## Tests

There are not too many 😢

```bash
npm test
```
