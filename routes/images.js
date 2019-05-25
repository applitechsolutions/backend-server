var express = require('express');
var fs = require('fs');

var app = express();

app.get('/:tipo/:imagen', function(req, res) {

    var tipo = req.params.tipo;
    var img = req.params.imagen;

    var path = `./uploads/${ tipo }/${ img }`;

    if (!fs.existsSync(path)) {
        path = './assets/';
        res.sendFile('no-image.jpg', { root: path });
    } else {
        path = `./uploads/${ tipo }`;
        res.sendFile(img, { root: path });
    }

});

module.exports = app;