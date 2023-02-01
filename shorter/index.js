var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var server = http.Server(app);
var { Server } = require("socket.io");
var io = new Server(server);
app.set('port', 5000);
//connect static files
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/img', express.static(__dirname + '/img'));
//connect DB
const { Pool } = require("pg");
const pool = new Pool({
    user:'postgres',
    password:'root',
    host:'localhost',
    port:5432,
    database:'shorter'
})
ArrayOfShortURL=[]
pool.query("SELECT shorturl FROM links;", (err ,res) => {
  if(err) throw err;
  res.rows.forEach(sl => ArrayOfShortURL.push(sl.shorturl));
});
//distribution of GET
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/:source', (request, response) => {
  pool.query("SELECT link FROM links WHERE shorturl='" + request.params.source + "';", (err ,res) => {
    if(err) throw err;
    if(res.rows.length==0){
      response.send('SHORT URL UNKNOWED')
    }else{
      response.redirect(res.rows[0].link)
    }
  });
});
counterUsers=0
io.on('connection', (socket) => {
  counterUsers++
  console.log('Now users:'+ counterUsers);
  

  socket.on('new request', (link) => {
    pool.query("SELECT shorturl FROM links WHERE link='" + link + "';", (err ,res) => {
      if(err) throw err;
      urls=res.rows;
      if (urls.length==0) {
        newShortURL = (Math.random() + 1).toString(36).substring(7);
        while (ArrayOfShortURL.indexOf(newShortURL)!=-1){
          newShortURL = (Math.random() + 1).toString(36).substring(7);
        }
        pool.query("INSERT INTO links VALUES (DEFAULT, '" + link + "', '" + newShortURL + "', 1);", (err ,res) => {
          if(err) throw err;
          socket.emit('response', newShortURL);
        });
        
      } else {
        socket.emit('response', urls[0].shorturl)
      }
    })
    
  });
  
  socket.on('disconnect', () => {
    counterUsers--
    console.log('Now users:'+ counterUsers);
  });
});



server.listen(5000, () =>{
    console.log('Запускаю сервер на порте 5000...');
});
