let wsocket;

let username = querySelect("#chat-user").value;
let message = querySelect("#chat-input").value;

// selects html element
function querySelect(selection) {
  return document.querySelector(selection);
}

// parse url into anchor element for easy indexing
function parseLocation(url) {
  let anchor = document.createElement("a");
  anchor.href = url;
  return anchor;
}

// write text to chatOutput, adds newline if needed, scrolls down
function writeOutput(text) {
  let chatOutput = querySelect("#chat-output");
  let innerHTML = chatOutput.innerHTML;

  // if empty, assign text, else add line break + text
  let newOutput = innerHTML === "" ? text : "<br/>" + text;

  chatOutput.innnerHTML = innerHTML + newOutput;

  chatOutput.scrollTop = chatOutput.scrollHeight;
}

function onLoad() {
  let localURL = parseLocation(window.location);
  wsocket = new WebSocket("ws://" + localURL.host, "chat-protocol");
}
