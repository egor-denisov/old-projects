function randomBomb(x,y,count){
  var bomb=new Set();
  while (bomb.size<count){
    rand_x=Math.floor(Math.random()*x);
    rand_y=Math.floor(Math.random()*y);
    bomb.add(rand_x+'_'+rand_y);
  }
  return Array.from(bomb)
}
function createMap(x,y,count){
  map=[];
  for (let i=0;i<y;i++){
    r=[];
    for(let k=0;k<x;k++){r.push(0)}
    map.push(r);
  }
  bombs=randomBomb(x,y,count)
  for (i in bombs){
    coords=bombs[i].split('_');
    bcx=Number(coords[0]);
    bcy=Number(coords[1]);
    map[bcy][bcx]='b';
    nearCells=[[bcx-1,bcy+1],[bcx,bcy+1],[bcx+1,bcy+1],[bcx+1,bcy],[bcx+1,bcy-1],[bcx,bcy-1],[bcx-1,bcy-1],[bcx-1,bcy]];
    for (let k=0;k<8;k++){
      nearx=nearCells[k][0];
      neary=nearCells[k][1];
      if (nearx>=0 && neary>=0 && nearx<x && neary<y && map[neary][nearx]!='b'){
        map[neary][nearx]=map[neary][nearx]+1;
      }
    }
  }
  return map
}
