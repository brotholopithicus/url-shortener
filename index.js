const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
const URI = require('./models/uri');

const dbAddress = 'mongodb://brotholopithicus:fTs5gyYg123$@ds135700.mlab.com:35700/url-shortener';
mongoose.connect(dbAddress);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('connected to db'));

const server = http.Server(requestHandler);


function requestHandler(req, res) {
    // favicon control
    if (req.url === '/favicon.ico') {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        const stream = fs.createReadStream(__dirname + '/favicon.ico');
        stream.pipe(res);
        console.log('favicon requested');
        return;
    }
    if (req.url === '/list') {
        URI.find({}, (err, results) => {
            if (err) return handleError(err);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(results));
            res.end();
            return;
        });
    }
    const URL = url.URL;
    try {
        const param = new URL(url.parse(req.url).path.substr(1));
        const newURI = new URI({ url: param });
        newURI.save((err, doc) => {
            if (err) return handleError(err);
            console.log(doc);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(doc));
            res.end();
        });
    } catch (err) {
        if (err instanceof TypeError && req.url !== '/list') {
            let query = url.parse(req.url).path.substr(1);
            URI.findOne({ id: query }, (error, result) => {
                if (error) return handleError(error);
                if (result) {
                    res.writeHead(302, { 'Location': result.url });
                    res.end();
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.write('URL Not Found');
                    res.end();
                    return;
                }
            });
        }
    }
}

function handleError(err) {
    console.log('WHEEP WHOOP');
    console.log(err);
    console.log('WHEEEP WHOOOP');
}
server.listen(3000, () => console.log('server running on port 3000'));
