import {inject} from 'aurelia-framework'
import {Gateway} from '../gateway'

@inject(Gateway)
export class Home{
    constructor(g){
        let time = 0;
        this.seconds = 0;
        let _this = this
        console.log(this)

        setInterval(()=>{
            _this.seconds = time/10; 
            time ++
        }, 100)
    }
}