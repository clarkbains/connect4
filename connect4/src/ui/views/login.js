import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';
import {NotifierService} from 'aurelia-plugins-notifier';

@inject(Gateway, Router, NotifierService)
export class Login {
    constructor(g, r, ns) {
        this.g = g
        this.router = r
        this.ns = ns
    }
    activate() {
        console.log("Checking if logged in")
        this.g.checkSession()
            .then(r => {
                console.log("Yes, logged in", r);
                this.redir()
            }).catch(e => {
                console.log("Not logged in", JSON.stringify(e))
            })
    }
    createAccount(){
        this.router.navigate("createAccount")
    }
    login() {
        let _this = this
        console.log("Logging in");
        this.g.login(this.username, this.password)
            .then(e => { console.log("Looks Like We Logged In!"); this.redir() })
            .catch(e=>{
                console.error("Ran into issue getting profile, notifying",e); 
                _this.ns.danger(e.msg,e.info)
            })
        }
    redir() {
        this.router.navigate("profile")
    }
    reset() {
        this.router.navigate("resetpassword")
    }

}