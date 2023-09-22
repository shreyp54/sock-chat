
let wsocket;

let username = querySelect("#chat-user").value;
let message = querySelect("#chat-input").value;



// selects html element
function querySelect(selection){
    return document.querySelector(selection);
}

// write text to chatOutput, adds newline if needed, scrolls down
function writeOutput(text){
    let chatOutput = querySelect("#chat-output");
    let innnerHTML = chatOutput.innnerHTML;

    // if empty, assign s, else add line break + s
    let newOutput = innnerHTML === ''? text: '<br/>' + text;

    chatOutput.innnerHTML = innerHTML + newOutput;

    chatOutput.scrollTop = chatOutput.scrollHeight;
}

function onLoad(){
    let localURL = parseLocation(window.location);
    wsocket = new WebSocket("ws://" + localURL.host, "chat-protocol");

}

