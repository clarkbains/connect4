import { inject } from 'aurelia-framework'
import { Gateway } from '../../gateway'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';

@inject(Gateway, NotifierService, Router)
export class UserPartial {
    constructor(g, ns, r) {
        this.gateway = g
        this.r = r
        this.ns = ns
    }

    bind(bindingContext, overrideContext) {
        this.parent = overrideContext.parentOverrideContext.parentOverrideContext.bindingContext
    }

    activate(o) {
        this.unknown = false;

        if (!o){
            this.unknown = true;
        }
        this.u = o;
        //console.log("Activated with user",o)

    }
    nav(){
        this.r.navigate("/profile/" + this.u.userid)
    }
}