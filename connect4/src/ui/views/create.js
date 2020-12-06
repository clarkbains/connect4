import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';
import {NotifierService} from 'aurelia-plugins-notifier';

@inject(Gateway, Router, NotifierService)
export class Create {
    constructor(g, r, ns) {
        this.g = g
        this.ns = ns
        this.router = r
    }
    activate() {
        console.log("Checking if logged in")
    }
    goBack(){
        this.router.navigateBack()
    }
    seed(){
        for (let i = 0; i<10; i++){
            this.g.createUser("username"+i, "username"+i+"@gmail.com", "User "+i)
        }
    }
    createAccount() {
        let _this = this
        this.g.createUser(this.username, this.email, this.name).then((e)=>{
            _this.ns.success(e.msg,e.info);
            this.router.navigate("login")
        }).catch(e=>{
            _this.ns.danger(e.msg,e.info)
        })

    }


}