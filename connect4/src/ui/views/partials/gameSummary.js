import { inject } from 'aurelia-framework'
import { Gateway } from '../../gateway'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';

@inject(Gateway, NotifierService, Router)
export class gameSummary {
    constructor(g, ns, r) {
        this.gateway = g
        this.r = r
        this.ns = ns
    }

    bind(bindingContext, overrideContext) {
        this.parent = overrideContext.parentOverrideContext.parentOverrideContext.bindingContext
        // console.log("Parent", this.parent)

    }

    activate(o) {
        this.g = o.game;
        this.pc = o.pc
    }
    promote() {
        let _this = this
        this.gateway.promoteMatch(this.g.match.matchid).then(() => {
            _this.ns.info("Accepted", "Game is accepted")
            _this.parent.reload()
            }).catch(e => {
                _this.ns.danger(e.msg, e.info)
        })
    }
    accept() {
        let _this = this
        this.gateway.respondToMatch(this.g.match.matchid, 1).then(() => {
            _this.ns.info("Accepted", "Match is Accepted")
            _this.parent.reload()
        }).catch(e => {
            console.log(e)
            _this.ns.danger(e.msg, e.info)
        })
    }
    deny() {
        let _this = this
        this.gateway.respondToMatch(this.g.match.matchid, 2).then(() => {
            _this.ns.info("Denied", "Match is Denied")
            _this.parent.reload()

        }).catch(e => {
            console.log(e)
            _this.ns.danger(e.msg, e.info)
        })
    }
    view() {
        this.r.navigate("games/" + this.g.game.gameid)
    }


}