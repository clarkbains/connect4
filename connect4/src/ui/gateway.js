import { inject } from 'aurelia-framework'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';
import { io } from 'socket.io-client'
@inject(Router, NotifierService)
export class Gateway {
    constructor(r, ns) {
        this.router = r
        this.id = undefined;
        this._logoutns = ns
        this.observers = []

    }
    setId(id) {
        this.id = id
    }
    getId() {
        return this.id
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

    connectSocket(event, func) {
        return new Promise((resolve, reject) => {
            let socket = io.connect(window.location.protocol + "//" + window.location.host)
            socket.on(event, func)
            socket.on('connect', function () {
                resolve(socket)
            });
        })


    }
    emit(ws, event, msg) {
        ws.emit(event, msg)
    }
    killSocket(socket) {
        socket.disconnect();
    }
    authGameSocket(gameid, id) {
        return this._request({
            path: `/private/games/${gameid}/moves/authorize`,
            method: "POST",
            body: {
                responseTopic: "moves",
                wsid: id
            }

        })
    }
    authMessageSocket(gameid, id) {
        return this._request({
            path: `/private/games/${gameid}/messages/authorize`,
            method: "POST",
            body: {
                responseTopic: "messages",
                wsid: id
            }

        })
    }
    sendMessage(gameid, msg) {
        return this._request({
            path: `/private/games/${gameid}/messages`,
            method: "POST",
            body: {
                msg: msg,
            }

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
            return e
        })
    }
    getUser(id) {
        return this._request({
            path: "/private/user/" + id,
            method: "GET",
        })


    }
    editMe(patch){
        return this._request({
            path: "/private/user/me",
            method: "PATCH",
            body: patch
        })
    }
    sendFriendRequest(userid) {
        return this._request({
            path: `/private/user/${userid}/friendrequests`,
            method: "POST",
        })
    }
    deleteFriend(userid){
        return this._request({
            path:`/private/user/me/friends/${userid}`,
            method: "DELETE"
        })
    }
    getFriendRequests(){
        
        return this._request({
            path: `/private/user/me/friendrequests`,
            method: "GET",
        })
    }
    getFriends(){
        return this._request({
            path: `/private/user/me/friends`,
            method: "GET",
        })
        
    }
    search(term){
        return this._request({
            path: `/private/user/search?term=${encodeURIComponent(term)}`,
            method: "GET",
        })
        
    }
    acceptFriendRequest(frid) {
        return this._request({
            path: `/private/user/me/friendrequests/${frid}/accept`,
            method: "POST",
        })
    }
    declineFriendRequest(frid) {
        return this._request({
            path: `/private/user/me/friendrequests/${frid}/deny`,
            method: "POST",
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
    makeMatch(person) {
        return this._request({
            path: `/private/games/requests`,
            method: "POST",
            body: {
                participants: [person],
                privacy:0,
                name:"Created from client"
            }
        })
    }
    promoteMatch(matchid) {
        let _this = this
        return this._request({
            path: `/private/games/requests/${matchid}/promote`,
            method: "POST",
            body: {}
        })
    }
    respondToMatch(matchid, status) {
        return this._request({
            path: `/private/games/requests/${matchid}/response`,
            method: "POST",
            body: {
                status: status
            }
        })
    }
    getGamesForUser(id){
        return this._request({
            path: `/private/user/${id}/games`,
            method: "GET",
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
    putMove(gameid, x) {
        return this._request({
            path: `/private/games/${gameid}/move`,
            method: "POST",
            body: {
                x: x
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
    createUser(username, email, name) {
        return this._request({
            path: "/public/user",
            method: "POST",
            body: {
                username: username,
                email: email,
                name: name
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
            path: "/private/logout",
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
                   // console.log("Verifying result")
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
