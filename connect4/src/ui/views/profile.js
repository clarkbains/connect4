import {inject} from 'aurelia-framework'
import {Gateway} from '../gateway'
import {NotifierService} from 'aurelia-plugins-notifier';

@inject(Gateway, NotifierService)
export class Profile{
    constructor(g, ns){
        this.gateway = g
        this.ns = ns
    }
    activate(obj){
        let _this = this
        let userId = obj.id || "me"
        console.log("Activiated with", userId)
        this.gateway.getUser(userId).then((r)=>{
            console.log(r.user)
            this.profile = r.user
            this.keys=Object.keys(this.profile)
            this.friend = true
        }).catch(e=>{
            console.error("Ran into issue getting profile, notifying",e); 
            _this.ns.danger(e.msg,e.info)
        })
        
    }
    toggleFriend(){
        this.friend = !this.friend
    }

    
}