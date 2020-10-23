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
        this.accepted = undefined
        console.log(this)
    }
    activate(){
        console.log("Activating view", this)
    }
    showBoard() {

    }

    createMatch() {
        let _this = this
        this.gateway.makeDemoMatch().then(e => {
            this.match = e.matchid
            _this.ns.success(e.msg,e.info)
        }).catch(e=>{
            _this.ns.danger(e.msg,e.info)
        })
    }

    acceptDemo() {
        let _this = this
        this.gateway.acceptDemo(this.match).then(e=>{
            _this.ns.success(e.msg, e.info)
            _this.accepted = true
        }).catch(e=>{
            console.log("errord",e)
            _this.ns.danger(e.msg, e.info)
        })
    }

    startGame() {
        let _this = this
        this.gateway.promoteDemoMatch(this.match).then(e => {
            this.game = e.gameid
            _this.ns.success(e.msg, e.info)
        }).catch(e=>{_this.ns.danger("error","We ran into an issue while proting the match to a game. Did you create a match yet?")})
    }
    getBoard(){
        this.gateway.getBoard(this.game).then(e=>{console.log("Got boards", e)})
    }


    isMyTurn() {
        //Shows notif it is your turn or not
    }

    getGameState() {
        //Shows notif if game is running or not
    }

    makeMove() {
        //Takes x coord, makes move, calles showBoard
    }
    getWinner() {
        //shows notif with the winner of the game
    }

    subscribeToEvent() {
        //Will subscribe on the event bus, just prints origin and destination currently
        //Can subscribe to moves, messages, or wins.
    }






}