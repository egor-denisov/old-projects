function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};
var socket = io();
const ModalWindow={
    template:`
    <div class="alert" @click="close">
        <div class="content" @click.stop>
            <div class="close" title="Close window" @click="close">&times;</div>
            <h1>{{errors[error][0]}}</h1>
            <p class="type_of_alert">{{errors[error][1]}}</p>
        </div>
    </div>`,
    data(){
        return {
            errors:[
                ["Error","This is not link. Try again"],
                ["Error2","This is not link. Try again"]
            ]
        }
    },
    methods:{
        close(){
            this.$emit("close-modal")
        }
    },
    props:{
        error:{
            type:String
        }
    }
}

const App = {
    data() {
      return {
        link:"",
        shortURL:"",
        alertModal:false,
        disableCopyButton:false,
        title:"Copy link",
        darkmode:false,
        myURL:document.location.protocol+'//'+document.location.host+'/'
      }
    },
    methods:{
        clrForm(){
            this.link="";
        },
        makeShorter(){
            if (!isValidURL(this.link)){
                this.alertModal=true;
                this.link="";
                this.shortURL="";
            }else{
                socket.emit("new request", this.link);
                socket.on("response", (data) =>{
                    this.shortURL=data;
                    var qr = new QRious({element: document.getElementById("qrcode"), value: (this.myURL+data), size:512});
                    document.getElementById("downloader").href=qr.toDataURL();
                });
            }
            this.disableCopyButton=false;
            this.title="Copy link";
        },
        copy(){
            navigator.clipboard.writeText(this.myURL+this.shortURL).then(()=>{
                this.disableCopyButton=true;
                this.title="Link was copied";
            })
        },
        paste(){
            navigator.clipboard.readText().then(text => {this.link=text}).catch(err=>{console.log(err)});
        },
        changeColormode(){
            this.darkmode=!this.darkmode;
            if (this.darkmode){
                document.querySelector("body").style.backgroundColor="#24242aff";
            }else{
                document.querySelector("body").style.backgroundColor="#ffffff";
            }  
        }
    }
  }
const app=Vue.createApp(App);
app.component("modal-window",ModalWindow);
app.mount("#app");
