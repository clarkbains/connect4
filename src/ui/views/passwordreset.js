import {inject} from 'aurelia-framework'
import {Gateway} from '../gateway'
import {Router} from 'aurelia-router';
//import {NotifierService} from 'aurelia-plugins-notifier';
@inject(Gateway, Router)
//@inject(Router)
export class PasswordReset{
    constructor(g, r){
        this.gateway = g
        this.router = r
   
       // this.ns = ns
       // let x = new NotifierService()
       //x.danger("oof")
       // c//onsole.log("Init password reset",g,r)
    }
    getToken(){
        this.gateway.getToken(this.username).then(r=>{
            this.token = r.token
        })
    }
    updatePassword(){
        let _this = this
        this.gateway.resetPasswordFromToken(this.token, this.password).then(r=>{
            _this.router.navigate("login")
        }).catch(e=>{
            console.log(e)
            _this.ns.danger(`The API Returned an Error`);
        })
    }


    
}