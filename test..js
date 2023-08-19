const http = require('[http](https://nodejs.org/api/http.html')

function httpHandler(request, response) {
   function onGotFilename(err, filename){
      function writeError(err){
         if (err.code == 'ENOENT'){
            response.writeHead(404, {'Content-Type': 'text/plain'})
            response.write('404 Not Found\n');
            response.end();
            console.log("Not Found" + filename);
         } else {
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.write('500 Internal Server Error');
            response.end();
            console.log('Internal Server Error: ' + filename + ': ' + err.code);
         }
      }

      if (err) {
         writeError(err);
      } else {
         fs.readFile(filename, "binary", function (err, file){
            if (err){
               writeError(err);
            } else {
               let mimeType = getMIMEType(filename);
               response.writeHead(200, {'Content-Type': mimeType});
               response.write(file, 'binary');
               response.end();
               console.log("Sending file: " + filename);
            }
         });
      }
   }

   let path = url.parse(request.url).pathname;
   getFilenameFromPath(path, onGotFilename);
}

http.createServer(httpHandler).listen(3490);