const application = new Vue({
    el: '#app',
    data: {
      message: 'Hello, Vue!',
      listCountry: Object.keys(dataCountries),
      userData: {
        "language":'EN',
        "city":'City',
        "country":'Country'
      },
      sCountry: '',
      sCity: '',
      listCity: [],
      keyCity: true,
      keyCountry: true,
      sourceMap: '',
      nCity: ''
    },
    methods: {},
    watch: {
      sCountry: (res) => {
        application.keyCity = true;
        application.keyCountry = true;
        application.listCity = dataCountries[res];
        application.sCity = '';
      },
      sCity: (res) => {
        application.keyCity=true;
        if (application.listCity != undefined){
          if (application.listCity.includes(res) && res != application.nCity){
            getWheather(res);
            application.nCity = res;
            document.querySelector("#place").innerHTML = application.sCountry + ', ' + application.sCity;
            application.keyCity = false;
            application.keyCountry = false;
          }
        }
      }
    }
  });

axios.get('http://ip-api.com/json').then(res => {
  if (res.data['city'] === 'St Petersburg'){
    res.data['city'] = 'Saint Petersburg';
  }
  application.userData["country"] = res.data['country'];
  application.sCountry = res.data['country'];
  application.userData["city"] = res.data['city'];
  application.sCity = res.data['city'];
  application.listCity = dataCountries[res.data['country']];
}).finally(() => { application.sCity = application.userData["city"] })
