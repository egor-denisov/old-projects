const application = new Vue({
      el: '#app',
      data: {
        mapSizes:[[5,5,6],[8,8,10],[16,8,20]],
        choosedSize:1,
        size_x:8,
        size_y:8,
        countOfBomb:10,
        gameStarted:false,
        map:[],
        screenSize:0,
        openCell:[],
        flagList:[],
        tweenedNumber:10,
        k:0.6,
        result:false
      },
      methods:{
        flag:(x,y)=>{
          if (application.flagList.indexOf(x+"_"+y)==-1){
            application.flagList.push(x+"_"+y);
            document.querySelector("#c"+x+"_"+y+" p").innerHTML='<svg style="width:80%;height:80%" viewBox="0 0 24 24"><path fill="currentColor" d="M7,2H9V22H7V2M19,9L11,14.6V3.4L19,9Z" /></svg>';
          }
          else{
            application.flagList.pop(x+"_"+y);
            document.querySelector("#c"+x+"_"+y+" p").innerHTML='&nbsp;';
          }
        },
        startGame:()=>{
          if (window.innerHeight<500 &&application.size_x>application.size_y){
            application.screenSize=0.7*window.innerWidth;
          }else{
            application.screenSize=Math.min(window.innerWidth,window.innerHeight);
          }
          if (application.size_x>application.size_y){
            application.k=0.95;
          }else if(application.screenSize<500){
            application.k=0.8;
          }else{
            application.k=0.6;
          };
          application.gameStarted=true;
          application.map=createMap(application.size_x,application.size_y,application.countOfBomb);

        },
        paintCell:(coordsCell)=>{
            xpaint=coordsCell[0];
            ypaint=coordsCell[1];
            val=map[ypaint][xpaint];
            if (val==0){
              document.querySelector("#c"+xpaint+"_"+ypaint).innerHTML='&nbsp;';
            }else if(val=='b'){
              document.querySelector("#c"+xpaint+"_"+ypaint).innerHTML='<svg style="width:80%;height:80%" viewBox="0 0 24 24"><path fill="currentColor" d="M23,13V11H19.93C19.75,9.58 19.19,8.23 18.31,7.1L20.5,4.93L19.07,3.5L16.9,5.69C15.77,4.81 14.42,4.25 13,4.07V1H11V4.07C9.58,4.25 8.23,4.81 7.1,5.69L4.93,3.5L3.5,4.93L5.69,7.1C4.81,8.23 4.25,9.58 4.07,11H1V13H4.07C4.25,14.42 4.81,15.77 5.69,16.9L3.5,19.07L4.93,20.5L7.1,18.31C8.23,19.19 9.58,19.75 11,19.93V23H13V19.93C14.42,19.75 15.77,19.19 16.9,18.31L19.07,20.5L20.5,19.07L18.31,16.9C19.19,15.77 19.75,14.42 19.93,13H23M12,8A4,4 0 0,0 8,12H6A6,6 0 0,1 12,6V8Z" /></svg>';
            }
            else if (val>0){
              document.querySelector("#c"+xpaint+"_"+ypaint).innerHTML=val;
            }
        },
        checkCell:(checkList)=>{
          for (i in checkList){
            coord=checkList[i];
            if (coord[0]>=0 && coord[1]>=0 && coord[0]<application.size_x && coord[1]<application.size_y && application.openCell.indexOf((coord[0]+'_'+coord[1]))==-1){
              if(map[coord[1]][coord[0]] =="b"){
                application.paintCell(coord);
                application.openCell.push((coord[0]+'_'+coord[1]));
                application.gameOver(0);
              }
              else if (map[coord[1]][coord[0]] >0) {
                application.paintCell(coord);
                application.openCell.push((coord[0]+'_'+coord[1]));
              }
              else if (map[coord[1]][coord[0]]==0) {
                application.paintCell(coord);
                application.openCell.push((coord[0]+'_'+coord[1]));
                x=coord[0];
                y=coord[1];
                application.checkCell([[x-1,y+1],[x,y+1],[x+1,y+1],[x+1,y],[x+1,y-1],[x,y-1],[x-1,y-1],[x-1,y]]);
              }
            }
          }
          if ((application.size_x*application.size_y-application.countOfBomb)<=application.openCell.length){
            application.gameOver(1);
          }
        },
        restartGame:()=>{
          application.result=false;
          application.gameStarted=false;
          application.map=[];
          application.openCell=[];
        },
        gameOver:(f)=>{
          if(f==0){application.result= 'You lose :( '}
          else{application.result= 'You win :) '};
          for (i in map){
            line=map[i];
            for (k in line){
              application.paintCell([k,i]);
            }}
      }},
      watch:{
        choosedSize:()=>{
          application.size_x=application.mapSizes[application.choosedSize][0];
          application.size_y=application.mapSizes[application.choosedSize][1];
          application.countOfBomb=application.mapSizes[application.choosedSize][2];
        },
        countOfBomb: (newValue)=>{
          k=application.tweenedNumber;
          if(newValue>k){
            function myLoop (i) {setTimeout(function () {if(i<=newValue){application.tweenedNumber=i;i++;myLoop(i)}}, 50)}
          }
          else{
            function myLoop (i) {setTimeout(function () {if(i>=newValue){application.tweenedNumber=i;i--;myLoop(i)}}, 50)}
          }
          myLoop(k);
        },
        gameStarted:(newValue)=>{
          if (newValue==true){
            setTimeout(()=>{window.scrollTo(0,document.body.scrollHeight)},0.05);
          }
        }
      }
  });
application.screenSize=Math.min(window.innerWidth,window.innerHeight)
window.onresize=()=>{
  application.screenSize=Math.min(window.innerWidth,window.innerHeight);
  if (window.innerHeight<500 &&application.size_x>application.size_y){
    application.screenSize=0.7*window.innerWidth;
  };
}
