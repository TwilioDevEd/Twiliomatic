function clipboardCopy(text) {
  // Use the Async Clipboard API when available. Requires a secure browsing
  // context (i.e. HTTPS)
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).catch(function (err) {
      throw err !== undefined
        ? err
        : new DOMException('The request is not allowed', 'NotAllowedError');
    });
  }

  // ...Otherwise, use document.execCommand() fallback

  // Put the text to copy into a <span>
  var span = document.createElement('span');
  span.textContent = text;

  // Preserve consecutive spaces and newlines
  span.style.whiteSpace = 'pre';

  // Add the <span> to the page
  document.body.appendChild(span);

  // Make a selection object representing the range of text selected by the user
  var selection = window.getSelection();
  var range = window.document.createRange();
  selection.removeAllRanges();
  range.selectNode(span);
  selection.addRange(range);

  // Copy text to the clipboard
  var success = false;
  try {
    success = window.document.execCommand('copy');
  } catch (err) {
    console.log('error', err);
  }

  // Cleanup
  selection.removeAllRanges();
  window.document.body.removeChild(span);

  return success
    ? Promise.resolve()
    : Promise.reject(
        new DOMException('The request is not allowed', 'NotAllowedError')
      );
}

const numberInput = document.getElementById('txt-number');
if (numberInput != null) {
  document.getElementById('btn-number').addEventListener('click', (e) => {
    clipboardCopy(numberInput.value);
  });
}
const envInput = document.getElementById('txt-env');
if (envInput != null) {
  document.getElementById('btn-env').addEventListener('click', (e) => {
    clipboardCopy(envInput.value);
  });
}
const webhookInput = document.getElementById('txt-webhook');
if (webhookInput != null) {
  document.getElementById('btn-webhook').addEventListener('click', (e) => {
    clipboardCopy(webhookInput.value);
  });
}

const styles = `padding: 5px; background-color: #121C2D; color: white; font-family:
         inter; font-weight:bold; border: 5px solid #0263E0; border-radius: 5px; font-size: 3em;`;
console.log(
  "%cBuilt using Paste, Twilio's Design System http://paste.twilio.design",
  styles
);
