import {inject} from 'aurelia-framework'
import {Router} from 'aurelia-router';
@inject(Router)
export class Gateway{
    constructor(r){
        this.router = r
        this.data = ""
        this.loggedin = false
        this.observers= []
    }
    foo(){
        console.log("DI Works", this.data)
    }
    bar(s){
        this.data = s
    }
    addLoggedInObserver(f){
        this.observers.push(f)
    }
    checkSession(){
        return this._verify(this._request({
            path:"/private/loginstatus",
            method:"GET"
         }).then(e=>{
             this.observers.forEach(f=>{f(true)})
             return e
            },e=>{
                this.observers.forEach(f=>{f(false)})
                throw e
            } ))
    }
    sessionNow(){
        return this.loggedin;
    }
    login(username, password){
        console.log(username,password)
        return this._verify(this._request({
            path:"/public/user/login",
            method:"POST",
            body:{
                username:username,
                password:password
            }
         })).then((e)=>{this.loggedin = true; this.observers.forEach(f=>{f(true)})})
         .catch(()=>{throw new LoginFailed("Try Adding A Username")})        
    }
    getUser(id){
        if (id == "me"){
            return this._verify(this._request({
                path:"/private/user/me",
                method:"GET",
              }))
        }
    
    }
    resetPasswordFromToken(token, password){
        return this._verify(this._request({
            path:"/public/user/changepassword",
            method:"POST",
            body:{
                token:token,
                newpassword:password
            }
         }))
    }
    getToken(username){
        return this._verify(this._request({
            path:"/public/user/sendresetemail",
            method:"POST",
            body:{
                username:username
            }
         }))
     }
    logout(){
        return this._logout()
    }
    _promisify(t,r){
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{if (r){return resolve()}reject()}, t)
        })
    }
    _logout(){
        return this._request({
            path:"/public/logout",
            method:"GET"
         }).then(e=>{
            this.observers.forEach(f=>{f(false)})
         })
        
       
    }
    _verify(promise){
        return promise.then(e=>{
            if (!e.code || !(e.code>=200 && e.code <=299)){
                console.warn("Throwing error", e ,e.ok); 
                if (e.code === 401){
                   this._logout()
                }
                throw new Error(e)

            }; return e})
        
    }
    _request(opts){
        let path = opts.path;
        delete opts.path
        opts.headers = opts.headers?opts.headers:{}
        opts.headers['Content-Type'] = "application/json;charset=utf-8"
        if (opts.body){
            opts.body = JSON.stringify(opts.body)
        }
        let url = window.location.protocol + "//" + window.location.host
        return fetch(url + "/api" + path, opts)
        .then(r=>r.json())
        
    }
}
export class LoginFailed{
    constructor(reason){
        this.reason = reason
    }
}
