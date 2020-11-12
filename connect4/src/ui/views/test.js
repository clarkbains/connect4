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
        this.match = undefined
        this.game = undefined
        this.wssid = undefined
        this.accepted = undefined
        console.log(this)
    }
    activate() {
        console.log("Activating view", this)
    }
    showBoard() {

    }

    createMatch() {
        let _this = this
        this.gateway.makeDemoMatch().then(e => {
            this.match = e.matchid
            _this.ns.success(e.msg, e.info)
        }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
    }
    socket(){
        let _this = this
        this.gateway.socketStart("counter",(data)=>{console.log("WSSS sent: ", data);_this.sock = data}).then(socket=>{
            this.wss = socket;
            console.log("got id:", socket.id)
        })

    }
    socketAuth(){
        if (this.wss.id==undefined){
            return console.log("You must start a socket before authing it")
        }
        this.gateway.socketAuth(this.wss.id)
    }
    socketDestroy(){
        this.gateway.killSocket(this.wss)
    }
    acceptDemo() {
        let _this = this
        this.gateway.acceptDemo(this.match).then(e => {
            _this.ns.success(e.msg, e.info)
            _this.accepted = true
        }).catch(e => {
            console.log("errord", e)
            _this.ns.danger(e.msg, e.info)
        })
    }

    startGame() {
        let _this = this
        this.gateway.promoteDemoMatch(this.match).then(e => {
            this.game = e.gameid
            _this.ns.success(e.msg, e.info)
        }).catch(e => { _this.ns.danger(e.msg, e.info) })
    }
    getBoard() {
        let _this = this
        this.gateway.getBoard(this.game).then(e => {
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
        this.gateway.getTurn(this.game).then(e => {
            _this.ns.success(e.msg, e.info)
        }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
    }

    finished() {
        let _this = this
        this.gateway.getState(this.game).then(e => {
            _this.ns.success(e.msg, e.info)
        }).catch(e => {
            console.error(e)
            _this.ns.danger(e.msg, e.info)
        })
    }

    place() {
        let _this = this
        console.log(`Placing for ${this.game} on pos ${this.xc}`)
        this.gateway.putMove(this.game, this.xc).then(e => {
            _this.ns.success(e.msg, e.info)
            _this.getBoard()
        }).catch(e => {
            console.error(e)
            _this.ns.danger(e.msg, e.info)
        })
        //Takes x coord, makes move, calles showBoard
    }
    winner() {
        let _this = this
        this.gateway.getWinner(this.game).then(e => {
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

    subscribeToEvent() {
        //Will subscribe on the event bus, just prints origin and destination currently
        //Can subscribe to moves, messages, or wins.
    }






}