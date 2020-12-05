import { inject } from 'aurelia-framework'
import { Gateway } from '../../gateway'
import { Router } from 'aurelia-router';
@inject(Router)
export class NavBar {
    constructor(r) {
        this.router = r
    }
    activate() {
      this.collap = true;
      
    }
    swap(){
      this.collap = !this.collap
    }
    collapse(loc){
     // console.log("Collapse",loc)
      this.collap = true;
      this.router.navigate(loc)
    }
}