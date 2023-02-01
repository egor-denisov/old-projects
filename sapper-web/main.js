var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var server = http.Server(app);


app.set('port', 5000);
//connect static files
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));
//

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});
server.listen(5000, () =>{
    console.log('Запускаю сервер на порте 5000');
});
