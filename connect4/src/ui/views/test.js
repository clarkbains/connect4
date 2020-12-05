import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';

@inject(Gateway, Router, NotifierService)
export class Test {
    constructor(g, r, ns) {
        this.gateway = g
        this.router = r
        this.ns = ns

        this.show = {}
        this.matchid = undefined
        this.gameid = undefined
        this.pid = undefined


        this.show.testMode = true
    }
    selectTestMode(mode) {
        this.show.testMode = false;
        this.show.ids = true;
        if (mode === "primary") {
            this.show.primaryUI = true;
            this.show.secondaryUI = false;
        } else {
            this.show.primaryUI = false;
            this.show.secondaryUI = true;
        }
    }
    activate() {
        this.pid = this.gateway.getId();
        console.log("Activating view", this)
    }






    createMatch() {
        console.log("Creating Match")
        let _this = this
        this.gateway.makeMatch(this.opponentId).then(e => {
            this.matchid = e.matchid
            _this.ns.success(e.msg, e.info)
            _this.ns.info("Accept", "Waiting for match to be accepted by other person.")
        }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
    }

    /* socketDestroy(){
         this.gateway.killSocket(this.wss)
     }*/
    /*emit(){
        this.gateway.emit(this.wss,"client45","m")
    }*/
    setMatchStatus(status) {
        let _this = this
        if (status == 1) {
            this.show.gameSelector = true;
        }
        this.gateway.respondToMatch(this.matchid, status).then(e => {
            _this.ns.success(e.msg, e.info)

        }).catch(e => {
            console.log("errord", e)
            _this.ns.danger(e.msg, e.info)
        })
    }

    startGame() {
        let _this = this
        this.gateway.promoteMatch(this.matchid).then(e => {
            _this.gameid = e.gameid
            _this.show.game = true;
            _this.show.ws = true;
            _this.ns.success(e.msg, e.info)
        }).then(() => { _this.getBoard() }).catch(e => { _this.ns.danger(e.msg, e.info) })
    }

    prettyBoard(b) {
        let r = ""
        let xindex = []

        console.log(b.reverse(), xindex)
        for (let y of b) {
            r += "|"
            for (let x of y) {
                let tsx = x ? String(x) : ""
                r += tsx.padStart(3, " ").padEnd(4, " ")
            }
            r += "\r\n"
        }
        for (let i = 0; i < b[0].length; i++) {
            r += String(i).padStart(3, " ").padEnd(4, " ")

        }

        return r
    }















}