import {inject} from 'aurelia-framework'
import {Gateway} from '../gateway'
import {Router} from 'aurelia-router';

@inject(Gateway, Router)
export class Logout{
    constructor(g,r){
        this.gateway = g
        this.router = r
    }
    logout (){
        console.log("Logging Out");
        this.gateway.logout().then(e=>{
            this.router.navigate("login")
        })
    }
    
}