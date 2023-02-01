function newData(data){
  document.querySelector("#temp").innerHTML = (Number(data['main']['temp'] - 273)).toFixed(1);
  document.querySelector("#feelTemp").innerHTML = (Number(data['main']['feels_like'] - 273)).toFixed(1);
  document.querySelector("#pres").innerHTML = (data["main"]["pressure"] * 0.7501).toFixed(0);
  document.querySelector("#hum").innerHTML = data["main"]["humidity"];
  document.querySelector("#wind").innerHTML = data["wind"]["speed"];
  document.querySelector("#clouds").innerHTML = data["weather"][0]["description"];
  let coords = [data["coord"]['lon'] - 0.35,data["coord"]['lat'] - 0.2, data["coord"]['lon'] + 0.35, data["coord"]['lat'] + 0.2];
  document.querySelector("#mapCity").src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + coords[0] + '%2C' + coords[1] + '%2C' + coords[2] + '%2C' + coords[3] + '&amp;layer=mapnik';
  document.querySelector("#time").innerHTML = convertDate(data["dt"] + data["timezone"]);
}
function getWheather(city){
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d3184e637375b934e355f321429c9dd4`;
  axios.get(url).then(res => {
    ans=res.data;
    newData(ans);
  }).catch(err => console.log(err))
};

function convertDate(unix){
  d = new Date();
  zone = d.getTimezoneOffset();
  var date = new Date((unix + zone * 60) * 1000);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var formattedTime = hours + ':' + minutes.substr(-2);
  return formattedTime + ' ' + month + '/' + day+'/' + year;
}
