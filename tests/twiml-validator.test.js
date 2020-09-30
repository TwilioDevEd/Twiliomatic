const validator = require("../assets/twiml-validator.private.js");

describe("twiml-validator", () => {
  test("when there is no response it throws", () => {
    expect(() => {
      validator("Boom");
    }).toThrow();
  });
  test("<Say> gives a VoiceResponse", () => {
    const twiml = `<Response><Say voice="Bob">Hi</Say></Response>`;
    expect(validator(twiml)).toBe("VoiceResponse");
  });
  test("<Message> returns MessagingResponse", () => {
    const twiml = `<Response><Message>txt</Message></Response>`;
    expect(validator(twiml)).toBe("MessagingResponse");
  });
  test("invalid twiml throws error", () => {
    const twiml = `<Response><Error></Error></Response>`;
    expect(() => {
      validator(twiml);
    }).toThrow();
  });
  test("mismatched voice and messaging throws error", () => {
    const twiml = `<Response><Message>Yikes</Message><Say>Whoops</Say></Response>`;
    expect(() => {
      validator(twiml);
    }).toThrow();
  });
  test("twiml nouns are also valid", () => {
    const twiml = `<Response><Dial><Conference>Nesting</Conference></Dial>`;
    expect(validator(twiml)).toBe("VoiceResponse");
  });
});