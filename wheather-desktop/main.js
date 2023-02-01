const path=require('path');
const url=require('url');
const {app,BrowserWindow}=require('electron')
let win;

function createWindow(){
  win=new BrowserWindow({
    width:1200,
    height:700,
    icon:__dirname+'/img/icon.png'
  });
  win.loadURL(url.format({
    pathname:path.join(__dirname,'index.html'),
    protocol:'file:',
    slashes:true
  }));
}
app.on('ready',createWindow);
