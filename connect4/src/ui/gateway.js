import { inject } from 'aurelia-framework'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';

@inject(Router, NotifierService)
export class Gateway {
    constructor(r, ns) {
        this.router = r
        this._logoutns = ns
        this.observers = []
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
            red: false,
            body: {
                username: username,
                password: password
            }
        }).then((e) => {
            this.observers.forEach(f => { f(true) })
        })
    }
    getUser(id) {
        return this._request({
            path: "/private/user/" + id,
            method: "GET",
        })


    }
    makeMove(gameId, coord) {
        return this._request({
            path: `/private/games/${gameId}/moves`,
            method: "POST",
            body: {
                x: coord.x,
                y: coord.y
            }
        })
    }
    makeDemoMatch() {
        return this._request({
            path: `/private/games/requests`,
            method: "POST",
            body: {}
        })
    }
    promoteDemoMatch(matchid) {
        return this._request({
            path: `/private/games/requests/${matchid}/promote`,
            method: "POST",
            body: {}
        })
    }
    acceptDemo(matchid) {
        return this._request({
            path: `/private/games/requests/${matchid}/acceptAll`,
            method: "POST",
            body: {}
        })
    }

    getBoard(gameid) {
        return this._request({
            path: `/private/games/${gameid}/board`,
            method: "GET",

        })
    }
    getTurn(gameid) {
        return this._request({
            path: `/private/games/${gameid}/turn`,
            method: "GET",

        })
    }
    getState(gameid) {
        return this._request({
            path: `/private/games/${gameid}/state`,
            method: "GET",

        })
    }
    getWinner(gameid) {
        return this._request({
            path: `/private/games/${gameid}/winner`,
            method: "GET",

        })
    }
    putMove(gameid,x) {
        return this._request({
            path: `/private/games/${gameid}/move`,
            method: "POST",
            body: {
                x:x
            }
        })
    }


    resetPasswordFromToken(token, password) {
        return this._request({
            path: "/public/user/changepassword",
            method: "POST",
            body: {
                token: token,
                newpassword: password
            }
        })
    }
    getToken(username) {
        return this._request({
            path: "/public/user/sendresetemail",
            method: "POST",
            body: {
                username: username
            }
        })
    }
    createUser(username, email) {
        return this._request({
            path: "/public/user",
            method: "POST",
            body: {
                username: username,
                email: email,
                name:name
            }
        })
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
            this.observers.forEach(f => { f(false) });
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
        return fetch(url + "/api" + path, opts).catch(e => { console.log("Serious Network Issue"); return undefined })
            .then(response => {
                //Not the best solution, but out handlers get to catch a network error, which is kinda cool
                //Maybe have this show a notification in the future, and then figure out how to break the promise chain.
                if (!response) {
                    throw { cls: "error", msg: "Network Error", info: "Cannot reach server", code: 500 }
                }
                let body = response.json()
                if (opts.verify) {
                    console.log("Verifying result")
                    // eslint-disable-next-line no-inner-declarations
                    function err(e, c) {
                        console.log("Caught request error, gracefully handling")
                        if (opts.red && false) {
                            if (c == 401) {
                                console.log("Attempting Logout")
                                this.ns.danger("Forbidden", "You are not allowed to access that resource")
                                //_this._logout()
                            }
                            else if (c == 404) {
                                _this.router.navigate("notFound")
                                this.ns.danger("Not Found", "That resource cannot be found")
                            }
                        }
                        return e.then(json => { throw json })

                    }

                    if (body && body.code && (body.code > 299)) {
                        return err(body, body.code)
                    }
                    else if (response.status > 299) {
                        return err(body, response.status)
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
