var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var ready=[];
var inGameUsers=[]
var all_gamers=[]
function win(m){
  if ((m[0]==m[1] && m[0]==m[2] && m[0]!=-1) || (m[0]==m[3] && m[0]==m[6] && m[0]!=-1) || (m[3]==m[4] && m[3]==m[5] && m[3]!=-1) || (m[6]==m[7] && m[6]==m[8] && m[6]!=-1) || (m[1]==m[4] && m[1]==m[7] && m[1]!=-1) || (m[2]==m[5] && m[2]==m[8] && m[2]!=-1) || (m[0]==m[4] && m[0]==m[8] && m[0]!=-1) || (m[2]==m[4] && m[2]==m[6] && m[2]!=-1)){
    return [true,'w']
}else if(!m.includes(-1)){
  return [true,'t']
}{return [false]}
};


app.set('port', 5000);
//Подключение статичных файлов
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));
// Маршруты
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});
// Запуск сервера
server.listen(5000, () =>{
    console.log('Запускаю сервер на порте 5000');
});

//События
io.on('connection', (socket) => {
  console.log('IN GAME USERS:',inGameUsers)
  let id=String(socket.id);
  let opponent =''
  all_gamers.push(id)
  socket.on('old_user',(data)=>{
    opp=data.idroom.replace(data.id,"")
    new_room=opp+id;
    if (inGameUsers.includes(opp)==true){
      io.sockets.sockets.get(opp).emit('replace_room',{id:id,room:new_room});
      io.sockets.sockets.get(opp).join(new_room)
      socket.join(new_room)
      inGameUsers.push(id);
      inGameUsers = inGameUsers.filter((n) => {return n != data.id});
      io.in(data.idroom).socketsLeave(data.idroom);
    }else{
      socket.emit('user_disconnect');
    }
  });
  socket.emit('your_id', id);
  socket.on('TimeUp',(data)=>{
    if(data.you==0){d=1}else{d=0}
    socket.broadcast.to(data.room).emit('win',{winner:d,room:data.room,cells:data.cells})
    inGameUsers = inGameUsers.filter((n) => {return n != data.room.slice(0,-20)});
    inGameUsers = inGameUsers.filter((n) => {return n != data.room.slice(20)});
    console.log('ROOM WAS DELETED '+data.room);
    io.in(data.room).socketsLeave(data.room);
  });
  socket.on('DisconGO',()=>{
    inGameUsers = inGameUsers.filter((n) => {return n != id});
  })
  socket.on('reconnected_data',(data)=>{
    inGameUsers.push(data.id);
    io.sockets.sockets.get(data.id).emit(data.gam,{you:data.you,cells:data.cells,room:data.room,timer:data.timer})
  });
  socket.on('ready', (data) => {
    if (ready.includes(data)!=true){
      ready.push(data);
    };
    if (ready.length>=2){
      inGameUsers.push(ready[0]);
      inGameUsers.push(data);
      socket.join(ready[0]+data);
      io.sockets.sockets.get(ready[0]).join(ready[0]+data);
      socket.emit('opp_gambit',{you:0,cells:[-1,-1,-1,-1,-1,-1,-1,-1,-1],room:ready[0]+data,timer:25});
      io.sockets.sockets.get(ready[0]).emit('u_gambit',{you:1,cells:[-1,-1,-1,-1,-1,-1,-1,-1,-1],room:ready[0]+data,timer:25});
      console.log('ROOM IS CREATE '+ready[0]+data);
      ready = ready.filter((n) => {return n != data});
      ready = ready.filter((n) => {return n != ready[0]});
    }
});
  socket.on('next_gambit', (data) => {
    checker=win(data.cells);
    if(checker[0]){
      if(data.you==0){d=1}else{d=0}
      if (checker[1]=='w'){
        io.sockets.to(data.room).emit('win',{winner:d,room:data.room,cells:data.cells})
      }else{
        io.sockets.to(data.room).emit('win',{winner:'tie',room:data.room,cells:data.cells})
      };
      inGameUsers = inGameUsers.filter((n) => {return n != data.room.slice(0,-20)});
      inGameUsers = inGameUsers.filter((n) => {return n != data.room.slice(20)});
      console.log('ROOM WAS DELETED '+data.room);
      io.in(data.room).socketsLeave(data.room);
    }
    else{
      socket.to(data.room).emit("your_gambit",data);
    }
  });
  socket.on('disconnect', () => {
    userRooms=Array.from(socket.adapter.rooms.keys());
    if (userRooms.length>0){
      if ((userRooms[userRooms.length-1]).length>20){
        io.sockets.to(userRooms[userRooms.length-1]).emit("opp_disconnect");
      }
    }
    all_gamers = all_gamers.filter((n) => {return n != id});
    ready = ready.filter((n) => {return n != id});
    inGameUsers = inGameUsers.filter((n) => {return n != id});
  });

});
