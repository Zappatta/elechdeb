
const {app, protocol} = require('electron');
const path = require('path');
const fs = require("fs");
const less = require("less");

app.on('ready', () => {
    protocol.registerStringProtocol('comlpile-less', (request, callback) => {

            let scssFilePath = "./" + request.url.replace("comlpile-less://", "");
            let lessFileContent = fs.readFileSync(scssFilePath).toString('utf-8');

            less.render(lessFileContent, function(e, output){
                callback({data: output.css, mimeType:"text/css", charset:"utf8"});
            });

    }, (error) => {
        if (error) console.error('Failed to register protocol')
    })
});

