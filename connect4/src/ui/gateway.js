import { inject } from 'aurelia-framework'
import { Router } from 'aurelia-router';

@inject(Router)
export class Gateway {
    constructor(r) {
        this.router = r
        this.data = ""
        this.observers = []
    }
    foo() {
        console.log("DI Works", this.data)
    }
    bar(s) {
        this.data = s
    }
    addLoggedInObserver(f) {
        this.observers.push(f)
    }
    checkSession() {
        return this._request({
            path: "/private/loginstatus",
            method: "GET",
            red: false
        }).then(e => {
            this.observers.forEach(f => { f(true) })
            return e
        }, e => {
            console.log("Notifying observers of logged out")
            this.observers.forEach(f => { f(false) })
            throw e
        })
    }

    login(username, password) {
        return this._request({
            path: "/public/user/login",
            method: "POST",
            red:false,
            body: {
                username: username,
                password: password
            }
        }).then((e) => {
            this.observers.forEach(f => { f(true) })
        })
          //  .catch(() => {
           //     throw new LoginFailed("Try Adding A Username")
            //})
    }
    getUser(id) {
        if (id == "me") {
            return this._verify(this._request({
                path: "/private/user/me",
                method: "GET",
            }))
        }

    }
    makeMove(gameId, x) {
        return this._verify(this._request({
            path: `/private/games/${gameId}/moves`,
            method: "POST",
            body: {
                x: x
            }
        }))
    }
    resetPasswordFromToken(token, password) {
        return this._verify(this._request({
            path: "/public/user/changepassword",
            method: "POST",
            body: {
                token: token,
                newpassword: password
            }
        }))
    }
    getToken(username) {
        return this._verify(this._request({
            path: "/public/user/sendresetemail",
            method: "POST",
            body: {
                username: username
            }
        }))
    }
    logout() {
        return this._logout()
    }
    _promisify(t, r) {
        return new Promise((resolve, reject) => {
            setTimeout(() => { if (r) { return resolve() } reject() }, t)
        })
    }
    _logout() {
        return this._request({
            path: "/public/logout",
            method: "GET"
        }).then(e => {
            this.observers.forEach(f => { f(false) })
        })


    }
    _verify(promise) {
        return promise
    }
    _request(opts) {
        let path = opts.path;
        delete opts.path
        opts.verify = opts.verify == undefined ? true : opts.verify
        opts.red = opts.red == undefined ? true : opts.red
        opts.headers = opts.headers ? opts.headers : {}
        opts.headers['Content-Type'] = "application/json;charset=utf-8"
        if (opts.body) {
            opts.body = JSON.stringify(opts.body)
        }
        let url = window.location.protocol + "//" + window.location.host
        let _this = this
        return fetch(url + "/api" + path, opts).catch(e=>{console.log("Serious Network Issue"); return undefined})
            .then(response => {
                //Not the best solution, but out handlers get to catch a network error, which is kinda cool
                //Maybe have this show a notification in the future, and then figure out how to break the promise chain.
                if (!response){
                    throw {cls:"error", msg:"Network Error", info:"Cannot reach server", code:500}
                }
                let body = response.json()
                if (opts.verify) {
                    console.log("Verifying result")
                    // eslint-disable-next-line no-inner-declarations
                    function err(e) {
                        console.log("Caught request error, gracefully handling")
                        if (opts.red) {
                            console.log("Attempting Logout")
                            _this._logout()
                        }
                        return e.then(json => { throw json })

                    }

                    if (body && body.code && body.code == 401) {
                        return err(body)
                    }
                    else if (response.status == 401) {
                        return err(body)
                    }

                }
                return body
            })
    }
}
export class LoginFailed {
    constructor(reason) {
        this.reason = reason
    }
}
