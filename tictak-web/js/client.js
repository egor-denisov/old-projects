var socket = io();
var app = new Vue({
el: '#app',
data: {
  gamers:['O','X',''],
  cells:[-1,-1,-1,-1,-1,-1,-1,-1,-1],
  gambit:false,
  wait:false,
  id:'',
  idroom:'',
  sign:-1,
  gameOver:false,
  oppInGame:true,
  timing:10,
  timeGambit:25,
  fakeTime:25,
  mode:false,
  darkmode:true,
  smallScreen:false,
  openSetting:false
},
methods:{
  ready:()=>{
    if (app.gameOver==false && app.mode){
      app.wait=true;
      socket.emit('ready',app.id);
    }else if(app.gameOver==false && !app.mode){
      p1=Math.floor(Math.random() * 2);
      if (p1==1){p2=0}else{p2=1}
      if(p1==1){
        app.sign=1;
        huPlayer=1;
        aiPlayer=0;
      }else{
        app.sign=0;
        huPlayer=0;
        aiPlayer=1;
        app.cells[Math.floor(Math.random() * 9)]=p2;
      };
      app.gambit=true;
      app.timerGambit(25)
    }
  },
  restartGame:()=>{
    app.gambit=false;
    app.cells=[-1,-1,-1,-1,-1,-1,-1,-1,-1];
    app.sign=-1;
    app.idroom='';
    app.gameOver=false;
  },
  timerOppDisCon:()=>{
    var tenTimeer=setInterval(()=>{
      app.timing--;
      if(app.timing<=0 || app.oppInGame || app.gameOver){
        clearInterval(tenTimeer);
        if (!app.oppInGame && !app.gameOver){
          app.oppInGame=true;
          app.gameOver='Соперник отключился';
          document.cookie='idRoom=false;max-age=-1';
          socket.emit('DisconGO');
        }}},1000);
    app.timing=10;
  },
  timerGambit:(time)=>{
    app.timeGambit=time;
    var tfTimeer=setInterval(()=>{
      app.timeGambit--;
      if(app.timeGambit<=0 || !app.oppInGame || app.gameOver || !app.gambit){
        clearInterval(tfTimeer);
        if (app.oppInGame && !app.gameOver && app.timeGambit<=0){
          app.gameOver='Время на ход вышло';
          app.gambit=false;
        }
      }},1000);
  }
},
watch:{
  darkmode:(mode)=>{
    if (mode){
      document.querySelector('body').classList.add("dm");
    }else{
      document.querySelector('body').classList.remove("dm");
    }
  }
}

});
function fakeTimer(time){
  app.fakeTime=time;
  ft=setInterval(()=>{
    app.fakeTime--;
    if(app.fakeTime<=0 || !app.oppInGame || app.gameOver|| app.gambit){
      clearInterval(ft);
    }},1000);
}
if (app.darkmode){
  document.querySelector('body').classList.add("dm");
}
const cookieId = document.cookie.match(/id=(.+?)(;|$)/);
const cookieIdRoom = document.cookie.match(/idRoom=(.+?)(;|$)/);
if (cookieIdRoom!=undefined){
  socket.emit('old_user',{id:cookieId[1],idroom:cookieIdRoom[1]});
}
socket.on('your_id', (id)=> {
  app.id=id;
  document.cookie='id='+id+';max-age=720';
});
socket.on('user_disconnect',()=>{
  document.cookie='idRoom=false;max-age=-1';
});
socket.on('u_gambit',(data)=>{
    document.cookie='idRoom='+data.room+';max-age=720';
    app.sign=data.you;
    app.wait=false;
    app.cells=data.cells;
    app.gambit=true;
    app.idroom=data.room;
    app.timerGambit(data.timer)

});
socket.on('opp_gambit',(data)=>{
    document.cookie='idRoom='+data.room+';max-age=720';
    app.sign=data.you;
    app.wait=false;
    app.cells=data.cells;
    app.gambit=false;
    app.idroom=data.room;
    fakeTimer(data.timer)
});
socket.on('message',(data)=>{alert(data)})
socket.on('win',(data)=>{
    if (data.winner=='tie'){
      app.gameOver='Ничья :/'
    }else if (app.sign==data.winner){
      app.gameOver='Ты победил :)'
    }else{
      app.cells=data.cells;
      app.gameOver='Ты проиграл :(';
    }
    document.cookie='idRoom=false;max-age=-1';
});
socket.on('your_gambit',(data)=>{
    app.cells=data.cells;
    app.gambit=true;
    app.timerGambit(25)
});
socket.on('opp_disconnect',()=>{
  app.oppInGame=false;
  app.timerOppDisCon();
});
socket.on('replace_room',(data)=>{
  if (app.gameOver==false){
    app.oppInGame=true;
    if (app.sign==1){d=0}else{d=1}
    if (app.gambit){
      socket.emit("reconnected_data",{timer:app.timeGambit,id:data.id,gam:"opp_gambit",you:d,cells:app.cells,room:data.room});
    }else{
      socket.emit("reconnected_data",{timer:app.fakeTime,id:data.id,gam:"u_gambit",you:d,cells:app.cells,room:data.room});
    }
    document.cookie='idRoom='+data.room+';max-age=720';
    app.idroom=data.room;
  }else{
    socket.emit('DisconGO');
  }

})
document.querySelector("table").onclick = (e)=>{
  j=Number(e.target.id.slice(1))
  if (app.cells[j]==-1 && app.gambit){
    app.$set(app.cells,j,app.sign)
    if (app.sign==1){d=0}else{d=1}
    if (app.mode){
      app.gambit=false;
      fakeTimer(25);
      socket.emit("next_gambit",{you:d,cells:app.cells,room:app.idroom});
    }else if(!app.gameOver){
      if (winning(app.cells,huPlayer)){
        app.gambit=false;
        app.gameOver='Ты победил :)'
      }
      if (emptyIndexies(app.cells).length==0){
        app.gambit=false;
        app.gameOver='Ничья :/'
      }
      app.gambit=false
      setTimeout(()=>{
        cellMM=minimax(app.cells,d);
        app.$set(app.cells,cellMM.index,d);
        app.gambit=true
        if (winning(app.cells,aiPlayer)){
          app.gambit=false;
          app.gameOver='Ты проиграл :(';
        }
        if (emptyIndexies(app.cells).length==0){
          app.gambit=false;
          app.gameOver='Ничья :/'
        }
        app.timerGambit(25)
      },1500);
    }
  }};



app.smallScreen=window.innerWidth<=1140
window.onresize=()=>{
    app.smallScreen=window.innerWidth<=1140
  }
