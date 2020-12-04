import { inject, observable } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';
@inject(Gateway, Router, NotifierService)
//@inject(Router)
export class Search {
    @observable username;
    constructor(g, r, ns) {
        this.gateway = g
        this.router = r
        this.ns = ns
        this.timeout;


    }
    update() {
        let _this = this
        if (this.username == ""){
            this.res = []
            return
        }
            
        this.gateway.search(this.username).then(r => {
            _this.res = r.users;
        })
        this.timeout = undefined;
    }
    usernameChanged(n, old) {
        if (!this.timeout) {
            setTimeout(this.update.bind(this), 200)
        }






    }
}