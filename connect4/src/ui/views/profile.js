import {inject} from 'aurelia-framework'
import {Gateway} from '../gateway'

@inject(Gateway)
export class Profile{
    constructor(g){
        this.gateway = g
    }
    activate(obj){
        let userId = obj.id || "me"
        console.log("Activiated with", userId)
        this.gateway.getUser(userId).then((r)=>{
            console.log(r.user)
            this.profile = r.user
            this.keys=Object.keys(this.profile)

        })
        this.friend = true
    }
    toggleFriend(){
        this.friend = !this.friend
    }

    
}