import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';

@inject(Gateway, Router)
export class Create {
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
    goBack(){
        this.router.navigateBack()
    }
    createAccount() {
        console.log("Logging in");
        this.router.navigate("login")
    }


}