const http = require("http");
const mime = require("mime");
const path = require("path");
const fs = require("fs");

let basepath = process.cwd();

function getFilenameFromPath(filepath, callback) {
  // Replaces + spaces in encoded URL with URI spaces, then decodes URI
  filepath = decodeURI(filepath.replace(/\+/g, "%20"));

  // Sterilize and turn into absolute path
  let filename = path.normalize(basepath + path.sep + filepath);
  let st;

  function onStatComplete(err, stats) {
    if (err) {
      return callback(err, filename);
    }

    if (stats.isDirectory()) {
      filename = path.normalize(filename + path.sep + "index.html");
      fs.stat(filename, onStatComplete);
      return;
    }

    if (stats.isFile()) {
      return callback(null, filename);
    } else {
      return callback(new Error('Unknown File Type'), filename);
    }
  }

  // make sure file is still in base directory
  if (filename.substring(0, basedir.length) != basedir) {
    let err = new Error("Not Found");
    err.code = "ENOENT";
    return callback(err, filename);
  }

  fs.stat(filename, onStatComplete);
}

// handle http requests
function httpHandler(request, response) {
  // async callback function for when filename found
  function onGotFilename(err, filename) {
    // handles errors
    function writeError(err) {
      if (err.code == "ENOENT") {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.write("404 Not Found\n");
        response.end();
        console.log("Not Found" + filename);
      } else {
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.write("500 Internal Server Error");
        response.end();
        console.log("Internal Server Error: " + filename + ": " + err.code);
      }
    }

    if (err) {
      writeError(err);
    } else {
      // If no error yet, readfile
      fs.readFile(filename, "binary", (err, file) => {
        if (err) {
          // Could have error reading file
          writeError(err);
        } else {
          // Now file data acquired, so send back to client

          // Get MIMEtype of file
          let mimeType = mime.getType(path.extname(filename));

          response.writeHead(200, { "Content-Type": mimeType });
          response.write(file, "binary");
          response.end();
          console.log("Sending file: " + filename);
        }
      });
    }
  }

  // Get the file's path from the request
  let path = url.parse(request.url).pathname;

  // Find the file associated with path
  getFilenameFromPath(path, onGotFilename);
}

http.createServer(httpHandler).listen(3490);
