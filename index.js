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
            let arr = [];
            results.forEach(result => arr.push({ id: result.id, url: result.url}));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(arr));
            res.end();
            return;
        });
    }
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<h4>Enter a URL as a parameter to recieve a shortened version or navigate to <a href="/list">/list</a> to show all shortened URLs available.</h4>`);
        res.end();
        return;
    }
    const URL = url.URL;
    try {
        const param = new URL(url.parse(req.url).path.substr(1));
        URI.findOne({ url: param }, (err, result) => {
            if (err) return handleError(err);
            if (!result) {
                const newURI = new URI({ url: param });
                newURI.save((err, doc) => {
                    if (err) return handleError(err);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    let resObj = {
                      id: doc.id,
                      url: doc.url
                    }
                    res.write(JSON.stringify(resObj));
                    res.end();
                });
            } else {
                if (result.id) {
                    console.log('redirect: ', result.id);
                    res.writeHead(302, { 'Location': '/' + result.id });
                    res.end();
                }
            }
        });
    } catch (err) {
        if (err instanceof TypeError && req.url !== '/list') {
            let query = url.parse(req.url).path.substr(1);
            URI.findOne({ id: query }, (error, result) => {
                if (error) return handleError(error);
                if (result) {
                    console.log('redirect: ', result.url);
                    res.writeHead(302, { 'Location': result.url });
                    res.end();
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.write('NOT A VALID URL\nex. https://www.google.com');
                    res.end();
                    return;
                }
            });
        }
    }
}

function handleError(err) {
    console.log(err);
}
server.listen(3000, () => console.log('server running on port 3000'));
