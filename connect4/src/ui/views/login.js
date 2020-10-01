import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';

@inject(Gateway, Router)
export class Login {
    constructor(g, r) {
        this.g = g
        this.router = r
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
    login() {
        console.log("Logging in");
        this.g.login(this.username, this.password)
            .then(e => { console.log("Looks Like We Logged In!"); this.redir() })
            .catch(e => { console.warn(e) })
            ;
    }
    redir() {
        this.router.navigate("profile")
    }

}