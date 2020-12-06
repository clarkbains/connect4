import {inject} from 'aurelia-framework'
import {Gateway} from '../gateway'
import {Router} from 'aurelia-router';
import {NotifierService} from 'aurelia-plugins-notifier';
@inject(Gateway, Router, NotifierService)
//@inject(Router)
export class PasswordReset{
    constructor(g, r,ns){
        this.gateway = g
        this.router = r
        this.ns = ns
   
       // this.ns = ns
       // let x = new NotifierService()
       //x.danger("oof")
       // c//onsole.log("Init password reset",g,r)
    }
    getToken(){
        let _this = this
        this.gateway.getToken(this.username).then(r=>{
            _this.token = r.token
        }).catch(e=>{
            _this.ns.danger(e.msg, e.info)
        })
    }
    async seed(){
        for (let i =0; i<10; i++){
            let r  = await this.gateway.getToken("username" + i)
            this.gateway.resetPasswordFromToken(r.token, "password"+i)
        }
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