import {inject} from 'aurelia-framework'
import {Gateway} from '../gateway'

@inject(Gateway)
export class Profile{
    constructor(g){
        this.gateway = g
    }
    activate(obj){
        console.log("Activiated with", obj)
     //   this.prof = 
        this.gateway.getUser(obj.id || "me").then((r)=>{
            console.log(r.user)
            this.profile = r.user
            this.keys=Object.keys(this.profile)

        })
    }

    
}