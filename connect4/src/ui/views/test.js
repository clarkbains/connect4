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

        this.wsprev = []

        this.messageSocket = undefined
        this.moveSocket = undefined

        setInterval(this.updateTime.bind(this), 5000)

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
    toggleWs(status) {
        let _this = this
        if (status == 1) {
            this.show.msgs = true;
            this.wsprev = []
            this.gateway.connectSocket("messages", this.updateMessages.bind(this))
                .then(socket => {
                    _this.messageSocket = socket
                    _this.gateway.authMessageSocket(_this.gameid, socket.id).then(e => {
                        console.log("Socket Auth Ran", e)
                    }).catch(e => {
                        console.error("Socket Auth Failed", e)
                    })
                })
            this.gateway.connectSocket("moves", this.getBoard.bind(this))
                .then(socket => {
                    _this.moveSocket = socket
                    _this.gateway.authGameSocket(_this.gameid, socket.id).then(e => {
                        console.log("Socket Auth Ran", e)
                    }).catch(e => {
                        console.error("Socket Auth Failed", e)
                    })
                })

        }
        if (status == 0) {
            this.show.msgs = false;
            this.gateway.killSocket(this.messageSocket)
            this.gateway.killSocket(this.moveSocket)
            this.moveSocket = undefined;
            this.messageSocket = undefined;
        }
        this.show.wsdiconnect = !this.show.wsdiconnect


    }

    updateMessages(data) {
        console.log(data)
        this.wsauthor = data.userid;
        this.wstime = new Date(data.time);
        this.wsmsg = data.msg
        this.wsprev.unshift(data.msg)
        this.wsprev = this.wsprev.slice(0, Math.min(this.wsprev.length, 5))
        this.updateTime()
    }
    updateTime() {
        let curr = new Date()
        if (this.wstime) {
            let show = ((curr - this.wstime) / 1000)
            let suffix = ""
            if (show < 60) {
                suffix = "s"
            }
            else if (show < 3060) {
                show = show / 60
                suffix = "m"
            }
            else {
                show = show / 3600
                suffix = "h"
            }
            this.wsshowtime = show.toFixed(0) + suffix
        } else {
            this.wsshowtime = ""
        }
    }
    sendMessage() {
        this.gateway.sendMessage(this.gameid, this.wsMsg)
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
    getBoard() {
        this.show.game = true;
        this.show.ws = true;
        let _this = this
        this.gateway.getBoard(this.gameid).then(e => {
            console.log("Got boards", e)
            this.boardDisplay.textContent = this.prettyBoard(e.resource)
        }).catch(e => {
            console.error(e)
            _this.ns.danger(e.msg, e.info)
        })
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

    turn() {
        let _this = this
        this.gateway.getTurn(this.gameid).then(e => {
            if (e.userid === _this.pid) {
                _this.ns.success("Turn", "It is your turn")
            } else {
                _this.ns.info("Turn", "It is someone else's turn")
            }
        }).catch(e => {
            console.log(e, _this.ns)
            _this.ns.danger(e.msg, e.info)
        })
    }

    finished() {
        let _this = this
        this.gateway.getState(this.gameid).then(e => {
            _this.ns.success(e.msg, e.info)
        }).catch(e => {
            console.error(e)
            _this.ns.danger(e.msg, e.info)
        })
    }

    place() {
        let _this = this
        console.log(`Placing for ${this.gameid} on pos ${this.xc}`)
        this.gateway.putMove(this.gameid, this.xc).then(e => {
            _this.ns.success(e.msg, e.info)
            //_this.getBoard()
        }).catch(e => {
            console.error(e)
            _this.ns.danger(e.msg, e.info)
        })
        //Takes x coord, makes move, calles showBoard
    }
    winner() {
        let _this = this
        this.gateway.getWinner(this.gameid).then(e => {
            if (e.resource === null) {
                _this.ns.info("Game Winner", "There is no winner, the game is not done yet")
            } else {
                _this.ns.success(e.msg, e.info)
            }
        }).catch(e => {
            console.error(e)
            _this.ns.danger(e.msg, e.info)
        })
    }








}