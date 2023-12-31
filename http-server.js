const http = require("http");
const mime = require("mime");
const path = require("path");
const fs = require("fs");

const PORT = "3490";
let basedir = process.cwd();

function getFilenameFromPath(filepath, callback) {
  // Replaces + (which is space) in encoded URL with URI spaces, then decodes URI
  let decfilepath = decodeURI(filepath.replace(/\+/g, "%20"));

  // Sterilize and turn into absolute path
  let abspath = path.normalize(basedir + path.sep + decfilepath);

  function onStatComplete(err, stats) {
    if (err) {
      return callback(err, abspath);
    }

    if (stats.isDirectory()) {
      abspath = path.normalize(abspath + path.sep + "index.html");
      fs.stat(abspath, onStatComplete);
      return;
    }

    if (stats.isFile()) {
      return callback(null, abspath);
    } else {
      return callback(new Error("Unknown File Type"), abspath);
    }
  }

  // make sure path is still in base directory
  if (abspath.substring(0, basedir.length) != basedir) {
    let err = new Error("Not Found");
    err.code = "ENOENT";
    return callback(err, abspath);
  }

  fs.stat(abspath, onStatComplete);
}

function httpHandler(request, response) {
  function onGotFilename(err, filename) {
    function writeError(err) {
      if (err.code == "ENOENT") {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.write("404 Not Found\n");
        response.end();
        console.log("Not Found " + filename);
      } else {
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.write("500 Internal Server Error");
        response.end();
        console.log("Internal Server Error: " + filename + ": " + err.code);
      }
    }

    function onOpenFile(err, file) {
      // err opening file
      if (err) {
        writeError(err);
      } else {
        // Now file data acquired, so send back to client
        let mimeType = mime.getType(path.extname(filename));

        response.writeHead(200, { "Content-Type": mimeType });
        response.write(file, "binary");
        response.end();
        console.log("Sending file: " + filename);
      }
    }

    if (err) {
      writeError(err);
    } else {
      fs.readFile(filename, "binary", onOpenFile);
    }
  }

  let filepath = new URL(request.url, `http://${request.hostname}/`).pathname;

  getFilenameFromPath(filepath, onGotFilename);
}

http.createServer(httpHandler).listen(PORT);
