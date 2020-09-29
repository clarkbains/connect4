import {inject} from 'aurelia-framework'
import {Gateway} from '../gateway'
import {Router} from 'aurelia-router';

@inject(Gateway,Router)
export class SampleGame{
    constructor(g, r){
        this.gateway = g
        this.router = r
    }
    sampleGame(){
        console.log(this)
        this.router.navigate("games/sample")
    }


    
}