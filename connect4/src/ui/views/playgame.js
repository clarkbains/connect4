import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';

@inject(Gateway, Router, NotifierService)
export class PlayGame {
    constructor(g, r, n) {
        this.gateway = g
        this.router = r
        this.ns = n
        this.gameInfo = {}

        this.width = 100;
        this.height = 100;
        this.history = false;
        this.def = []
        this.msgs = []
        this.pc = {}
        this.socket = undefined
        this.myTurn = false

    }
    async activate(obj, routeConfig, navigationInstruction) {
        this.spectate = navigationInstruction.queryParams.mode === "spectate"
        this.gameid = obj.id
        if (!this.gameid) {
            this.router.navigate("gameSelection")
        }
        let _this = this
        window.addEventListener('resize', function (event) {
            if (_this.timeout) {
                return
            }
            _this.timeout = setTimeout(() => {
                _this.resize()
                _this.timeout = undefined
            }, 100)
        });
        try {
            let mr = await this.gateway.getMatch(this.gameid)
            console.log("Got MR", mr)
            this.match = mr.match
            this.width = this.match.width
            this.height = this.match.height
            this.msg = mr.match.msg

            this.socket = await this.gateway.connectSocket()
            //await this.gateway.authGameSocket(this.gameid, this.socket)
            await Promise.all([
                this.gateway.authGameSocket(this.gameid, this.socket),
                this.gateway.authMessageSocket(this.gameid, this.socket),
                this.gateway.authParticipantsSocket(this.gameid, this.socket)
            ])
            this.socket.on('moves', this.onMove.bind(this))
            this.socket.on('messages', this.onMessage.bind(this))
            this.socket.on('participants', this.onParticipant.bind(this))
            console.log("Running On Participant")
            //this.onParticipant()
            this.resyncMessages()
            this.getBoard()
        } catch (e) {
            console.error(e)
            this.ns.danger("Private Game", "You are not allowed to see this game")
            this.router.navigateBack()
        }

    }
    detached() {
        this.gateway.killSocket(this.socket)
    }
    resyncMessages() {
        console.log("Resync messages")

        let _this = this
        this.gateway.getMessage(this.gameid).then(async (r) => {
            _this.msgs = []
            console.log("Resynced messages", r)
            for (let msg of r.messages) {
                msg.user = await _this.getFromPc(msg.userid)
                _this.msgs.unshift(msg)
            }
            _this.onMessage()
        })
    }
    onParticipant() {
        let _this = this
        return this.gateway.getParticipants(this.gameid).then(e => {
            _this.players = e.players
            _this.spectators = e.watchers
            return true
        }).catch(e => {
            console.error(e)
        })
    }
    async getFromPc(userid) {
        if (!this.pc[userid]) {
            this.pc[userid] = (await this.gateway.getUser(userid)).user
        }
        return this.pc[userid]
    }
    async onMessage(msg) {
        if (msg) {
            msg.user = await this.getFromPc(msg.userid)
            this.msgs.unshift(msg)
            console.log("Added messages", msg, this.msgs)
        }
        this.msgs = this.msgs.slice(0, Math.min(this.msgs.length, 20))


    }
    async toggleLive() {
        console.log("Toggling Live Modes")
        if (this.history) {
            //Goes to most recent
            await this.histMove(2)
            this.history = undefined
        }
        else {
            await this.setupHist()
            await this.showHistBoard()
        }
    }
    async histMove(type) {
        console.log("Moving through hist with num")
        if (type == 2 || (type == 1 && this.history.current + 2 > this.history.total)) {
            await this.setupHist()
        }
        if (type == 2) {
            this.history.current = this.history.total
        } else if (type == 1) {
            this.history.current++
        }
        else if (type == -1) {
            this.history.current--
        }
        else if (type == -2) {
            this.history.current = 0;
        }
        this.history.current = Math.max(0, Math.min(this.history.current, this.history.total))
        this.history.prev = this.history.current > 0
        console.log("Currently on Hist", this.history.current)

        this.showHistBoard()
    }
    async showHistBoard() {
        let board = []

        for (let rowNum = 0; rowNum < this.rows; rowNum++) {
            let r = []
            for (let colNum = 0; colNum < this.cols; colNum++) {
                r.push(null)
            }
            board.push(r)
        }
        console.log("Empty board", board)
        for (let i = 0; i < this.history.current; i++) {
            board[this.history.moves[i].y][this.history.moves[i].x] = this.history.moves[i].userid
        }
        console.log("Filled board", board)
        this.update(board)
    }

    async setupHist() {
        console.log("Setting up history")
        let moveresp = await this.gateway.getIncrementalMoves(this.gameid)
        console.log("Got Incremental moves")
        let idex = this.history ? this.history.current : 0
        this.history = {
            moves: moveresp.moves,
            total: moveresp.moves.length,
            current: idex,

            //next:idex<moveresp.moves.length-1
        }
        if (this.history.total == 0) {
            this.history = undefined;
            this.ns.info("History Mode", "Cannot go into history mode on game with no moves")
        }
    }

    onMove() {
        //Don't act on wss if in history mode
        if (this.history) {
            return
        }
        console.log("On Move", this)
        this.getBoard()
    }

    async update(data) {
        console.log("Updating Data", data)
        this.def = data
        this.context.clearRect(0, 0, this.width, this.height);
        if (this.spectate) {
            this.context.fillStyle = 'gray';

        } else {
            this.context.fillStyle = 'black';

        }
        this.context.lineWidth = 15;
        this.context.beginPath();

        this.rows = data.length || 10
        this.cols = data.length ? data[0].length : 10

        this.context.rect(0, 0, this.width, this.height);
        this.context.fill();
        let gotPlayers = false
        if (!this.allPlayers) {
            let res = (await this.gateway.getPlayers(this.gameid)).users
            this.allPlayers = res
            gotPlayers = true
        }

        let s = this.allPlayers.sort()
        let colours = ["red", "purple", "blue", "green"]
        let colourMap = {}
        for (let i in s) {
            colourMap[s[i]] = colours[i]
        }
        this.colourMap = colourMap;
        if (gotPlayers) {
            this.onParticipant()

        }
        console.log(colourMap)
        for (let rowNum = 0; rowNum < this.rows; rowNum++) {
            for (let colNum = 0; colNum < this.cols; colNum++) {

                if (data && data.length > 0) {
                    let co = data[this.rows - rowNum - 1][colNum]
                    if (typeof co !== "number")
                        this.context.fillStyle = "white"
                    else
                        this.context.fillStyle = colourMap[co];
                } else {
                    this.context.fillStyle = "white"
                }
                if (this.spectate) {
                    this.context.strokeStyle = 'gray';

                } else {
                    this.context.strokeStyle = 'black';

                }


                this.context.beginPath();
                this.context.ellipse(
                    this.getCircleWidth() * colNum + this.getCircleWidth(),
                    this.getCircleHeight() * rowNum + this.getCircleHeight(),
                    0.85 * this.getCircleWidth() / 2,
                    0.85 * this.getCircleHeight() / 2,
                    0,
                    0,
                    Math.PI * 2);
                this.context.stroke();
                this.context.fill();

            }
        }

    }


    getCircleHeight() {
        return this.height / (this.rows + 1)
    }
    getCircleWidth() {
        return this.width / (this.cols + 1);
    }


    resize() {
        this.height = this.m.clientWidth * 0.95;
        this.width = this.m.clientWidth * 0.95;
        //console.log("Resizing, ",this.height, this.width)
        this.game.height = this.height;
        this.game.width = this.width;
        this.update(this.def)
    }

    getMousePos(rect, evt, w, h) {
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * w,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * h
        };
    }

    clickHandler(e) {
        if (this.spectate) return
        console.log(e, this)
        var rect = this.game.getBoundingClientRect();
        console.log(e.clientX - rect.left, e.clientY - rect.top, this.getMousePos(rect, e, this.width, this.height))
        const coord = {
            x: (e.clientX - rect.left - this.getCircleWidth()) / this.getCircleWidth() + 0.5,
            y: (e.clientY - rect.top - this.getCircleHeight()) / this.getCircleHeight() + 0.5,
        }
        const floored = {
            x: Math.floor(coord.x),
            y: Math.floor(coord.y)
        }
        console.log("Coords are", floored)
        this.place(floored.x)
    }

    attached(obj) {
        this.m = this.widthDiv
        console.log(this.m)
        this.context = this.game.getContext('2d');
        let _this = this
        this.game.addEventListener('click', ((e) => { this.clickHandler(e) }).bind(this));
        this.resize()
    }


    sendMessage() {
        let _this = this
        this.gateway.sendMessage(this.gameid, this.wsMsg).then(e=>{
            _this.wsMsg = ""
        }).catch(e => {
            console.error(e)
            _this.ns.warning("Message", "Must contain content")
        })

    }
    async getBoard() {
        let _this = this
        this.gateway.getBoard(this.gameid).then(e => {
            console.log("Got boards", e)
            _this.update(e.resource)
        }).catch(e => {
            console.error(e)
            _this.ns.danger(e.msg, e.info)
        })
        let state = await this.gateway.getState(this.gameid)
        this.myTurn = state.currentTurn === this.gateway.getId()
        console.log("State is ", state)
        if (state.finished) {
            this.spectate = true
            if (state.winner === this.gateway.getId()) {
                this.ns.success("Congrats", "You Won the game")
            } else {
                let winner = await this.getFromPc(state.winner)
                this.ns.info("Game Ended", "This Game has now concluded")
            }
            this.gateway.getBoard(this.gameid).then(e => {
                console.log("Got boards", e)
                _this.update(e.resource)
            })
            this.g
        } else if (this.myTurn) {
            this.ns.info("Turn", "It is now your turn")
        }
    }

    place(xc) {
        let _this = this
        this.gateway.putMove(this.gameid, xc).then(e => {
           // _this.ns.success(e.msg, e.info)
            //_this.getBoard()
        }).catch(e => {
            console.error(e)
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
    turn() {
        let _this = this
            .catch(e => {
                console.log(e, _this.ns)
                _this.ns.danger(e.msg, e.info)
            })
    }

}