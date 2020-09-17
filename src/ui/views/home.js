export class Home{
    constructor(){
        let time = 0;
        setInterval(()=>{this.seconds = time/10; time ++}, 100)
    }
}