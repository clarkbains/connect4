import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';

@inject(Router)
export class NotFound {
    constructor(r) {
        this.router = r
    }
    activate() {
    }
    goHome(){
        this.router.navigate("")
    }



}