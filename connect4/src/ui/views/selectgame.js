import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';

@inject(Gateway, Router, NotifierService)
export class SelectGame {
    constructor(g, r, n) {
        this.gateway = g
        this.router = r
        this.ns = n
        this.randPriv = "Private"
        this.selPriv = "Private"
        this.randGameName = "ahhhhhhhhhhhhhhhhhhhh"
    }
    activate(opts) {
        this.opts = opts
        let _this = this
        if (opts.id)
            this.gateway.getUser(opts.id).then(u => {
                _this.knownMsg = `Game with ${u.user.username}`
                _this.username = u.user.username
            }).catch(e => {
                _this.ns.danger(e.msg, e.info)
            })
    }
    sampleGame() {
        console.log(this)
        this.router.navigate("games/sample")
    }
    textToPrivLevel(t) {
        let privs = ["Public", "Friends Only", "Private"]
        console.log(t, privs.indexOf(t))

        for (let i = 0; i < privs.length; i++) {
            if (t === privs[i])
                return i;
        }
        return 0;
    }
    joinExisting() {
        let _this = this
        this.gateway.joinMatch(this.textToPrivLevel(this.randPriv)).then((e)=>{
            console.log(e)
            _this.router.navigate("profile")
        }).catch(e => {
            _this.triedJoining = true
            _this.ns.warn(e.msg, e.info)
        })
    }
    createPublic(){
        let _this = this
        this.gateway.makeMatch(undefined, this.randGameName, this.textToPrivLevel(this.randPriv)).then((e)=>{
            console.log(e)
            _this.router.navigate("profile")
        }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
        
    }
    createWithUser(){
        let _this = this
        this.gateway.makeMatch(this.opts.id, this.knownMsg, this.textToPrivLevel(this.selPriv)).then((e)=>{
            console.log(e)
            _this.router.navigate("profile")
        }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
    }



}