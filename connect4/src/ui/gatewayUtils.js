
export class GatewayUtils{
    constructor(){
        this.data = ""
    }
    foo(){
        console.log("DI Works", this.data)
    }
    bar(s){
        this.data = s
    }
    checkSession(){

    }
}