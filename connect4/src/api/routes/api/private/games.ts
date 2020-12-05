import express from 'express'
import * as statuses from '../../../resources/APIStatus'
import * as models from '../../../models/models'
import * as APIHelpers from '../../../resources/APIHelpers'
import Game from '../../../resources/Game'
import { Database } from 'sqlite3'
module.exports = class {
    app: express.Application
    opts: object
    games: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
        this.games = {}
    }
    async fetchGameNoPerms(gameid) {

        if (this.games[gameid]) {
            return this.games[gameid]
        }
        this.games[gameid] = new Game(this.opts.gateway, gameid)

        return this.games[gameid]
    }
    async isInGame(gameid, userid){
        if (!gameid && gameid!==0){
            throw new Error("Gameid Not provided")
        }
        let m = await new models.DatabaseGame({gameid:gameid}).select({db:this.opts.gateway.db})
        if (!m){
           throw new Error("Cannot Find Game")
        }
        if (!userid && userid!==0){
            throw new Error("Userid not provided")
         }
        let player = await new models.DatabaseMatchAcceptance(
            {status:1,
            matchid:m[0].matchid,
            userid:userid
        }).select({db:this.opts.gateway.db})
        return player.length > 0
    }
    async fetchGame(gameid, userid) {
        if (!gameid && gameid!==0){
            return undefined
        }
        console.log("Retrieving Game id", gameid, "for", userid)

        let game = await (new models.DatabaseGame({gameid:gameid})).select({db:this.opts.gateway.db})
        if (game.length == 0){
           return undefined 
        }
        let m = await new models.DatabaseMatch({}).raw(this.opts.gateway.db,
            {
                sql: `SELECT Matchs.privacylevel, Matchs.matchid from Games LEFT JOIN Matchs on Games.matchid = Matchs.matchid WHERE Games.gameid=?`,
                params: [gameid],
                single:true,
                model:models.DatabaseMatch
            })
 
        if (m.privacylevel >= 1){

            //The User is not playing the game
            if (!this.isInGame(gameid, userid)){
                if (m.privacylevel == 2){
                    console.log("Private Game viewed by non playing member")
                    return undefined;
                    
                }
                let players = await new models.DatabaseMatchAcceptance({
                    matchid:m.matchid,
                    status:1,
                }).select({db:this.opts.gateway.db})

                let foundFriend = false;
                for (let p of players){
                    let friends = await new models.DatabaseFriend({
                        user1: p.userid,
                        user2: userid
                    }).select({db:this.opts.gateway.db})
                    if (friends){
                        foundFriend = true
                        break;
                    }
                }
                if (!foundFriend){
                    console.log("Friends only game loaded by non-friend")
                    return undefined;
                }
            }


        }
        return this.fetchGameNoPerms(gameid)
        


    }
    setupApplication() {
        /*this.app.get("/", (req, res) => {
            let detail = req.query.detail
            let active = req.query.active
            let won = req.query.won
            //Get Games
            throw new statuses.ResourcePermissionError()
        })*/
        this.app.get("/:gameid/players", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await this.fetchGame(req.params.gameid, res.locals.user.userid)
            if (!g){
                throw new statuses.ResourcePermissionError()
            }

            let r = new statuses.GetUsersSuccess((await g.getPlayers()).filter(r=>r>=0))           
    
            success(r)

        }))

        /*this.app.get("/:gameid/moves", (req, res) => {
            let gameid = req.params.gameid
            let mode = req.query.mode
            //Get Game moves
        })*/
        this.app.post("/:gameid/moves/authorize", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await this.fetchGame(req.params.gameid, res.locals.user.userid)
            if (!g){
                throw new statuses.ResourcePermissionError()
            }

            let r = new models.EventSubscription(req.body)
            r.topic = "moves" + req.params.gameid
            APIHelpers.VerifyProperties(r)
            
            let _this = this
            this.opts.bus.promoteWS(res.locals.user, r.wsid, r.topic, r.responseTopic)
            success(new statuses.GenericSuccess())

        }))

        this.app.post("/:gameid/participants/authorize", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await this.fetchGame(req.params.gameid, res.locals.user.userid)
            if (!g){
                throw new statuses.ResourcePermissionError()
            }

            let r = new models.EventSubscription(req.body)
            r.topic = "participants" + req.params.gameid
            APIHelpers.VerifyProperties(r)
            
            let _this = this

            g.tracker.update(res.locals.user.userid)

            this.opts.bus.promoteWS(res.locals.user, r.wsid, r.topic, r.responseTopic, {
                'disconnect': async (data, user, socket) => {
                    let game: Game = await _this.fetchGame(req.params.gameid, user.userid)
                    game.tracker.delete(user.userid)
                    console.log("User has stopped watching the game.")
                    _this.opts.bus.emit("participants" + req.params.gameid, {})

                }
            })
            this.opts.bus.emit("participants" +  req.params.gameid, {})
            success(new statuses.GenericSuccess())

        }))

        this.app.get("/:gameid/participants", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await this.fetchGame(req.params.gameid, res.locals.user.userid)
            if (!g){
                throw new statuses.ResourcePermissionError()
            }
            let participants = await g.getPlayers()
            participants = participants.filter((e)=>e>=0)
            let allConnected = g.tracker.getAll()
            let _this = this

            let watchers = allConnected.filter((e)=>!participants.includes(e))
               
            participants = allConnected.filter((e)=>participants.includes(e))
            
            success(new statuses.GameWatchers(
                await Promise.all(participants.map(e=>APIHelpers.GetUser(res.locals.user, e, _this.opts.gateway.db))), 
                await Promise.all(watchers .map(e=>APIHelpers.GetUser(res.locals.user, e, _this.opts.gateway.db)))))

        }))

        this.app.get("/:gameid/board", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {

            let gameid = req.params.gameid
            let game = await this.fetchGame(gameid, res.locals.user.userid)
            let board = await game.getBoard()
            //console.log("Got board",board)
            success(new statuses.ResourceSuccess(board))

        }))
        this.app.post("/:gameid/resign", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {

            let gameid = req.params.gameid
            let game = await this.fetchGame(gameid, res.locals.user.userid)
            let winners = await game.getUsersWhoArent(res.locals.user.userid)
            console.log(winners)

            let d = new models.DatabaseGameMessage({
                gameid:gameid,
                userid: res.locals.user.userid,
                msg:"(auto) I have Resigned",
                time: +new Date()
            });
            await d.insert({ db: this.opts.gateway.db })
            success(new statuses.ResignationSuccess())
            this.opts.bus.emit("moves" + gameid, {})
            this.opts.bus.emit("messages" + req.params.gameid, d)

        }))
        this.app.get("/:gameid/turn", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let gameid = (req.params.gameid || "").match(/(\d*)/)
            if (!gameid || !gameid[1]) {
                throw new statuses.MissingRequiredField(["gameid"])
            }
            gameid = gameid[1]
            let game;
            try {
                game = await this.fetchGame(gameid, res.locals.user.userid)
            } catch {
                throw new statuses.ResourcePermissionError()
            }
            try {
                let turn = await game.turn(res.locals.user.userid)
                success(new statuses.TurnSuccess(turn))

            } catch (e) {
                console.log(e)
                throw new statuses.GenericErrorWrapper(e)
            }
        }))
        this.app.post("/:gameid/messages", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new models.Message(req.body)
            r.userid = res.locals.user.userid
            APIHelpers.VerifyProperties(r)
            
            if (!await this.isInGame(req.params.gameid, r.userid)){
                throw new statuses.ResourcePermissionError()
            }

            let d = new models.DatabaseGameMessage(r);
            d.time = +new Date();
            d.gameid = req.params.gameid
            await d.insert({ db: this.opts.gateway.db })
            this.opts.bus.emit("messages" + req.params.gameid, d)
            console.log(`User ${d.userid} has sent message ${d.msg}`)
            success(new statuses.GenericSuccess())

        }))
        this.app.get("/:gameid/messages", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let game:Game = await this.fetchGame(req.params.gameid, res.locals.user.userid)
            //let game = await this.isInGame(req.params.gameid, r.userid)
            if (!game){
                throw new statuses.ResourcePermissionError()
            }

            let msgs = await new models.DatabaseGameMessage({gameid: req.params.gameid}).select({db:this.opts.gateway.db})
            success(new statuses.MesageSuccess(msgs))
        }))

        this.app.post("/:gameid/messages/authorize", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new models.EventSubscription(req.body)
            r.topic = "messages" + req.params.gameid
            APIHelpers.VerifyProperties(r)
            let game:Game = await this.fetchGame(req.params.gameid, res.locals.user.userid)
            //let game = await this.isInGame(req.params.gameid, r.userid)

            if (!game){
                throw new statuses.ResourcePermissionError()
            }
            this.opts.bus.promoteWS(res.locals.user, r.wsid, r.topic, r.responseTopic)
            
            success(new statuses.GenericSuccess())
            //Get All Request
        }))
        this.app.get("/:gameid/winner", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let gameid = (req.params.gameid || "").match(/(\d*)/)
            if (!gameid || !gameid[1]) {
                throw new statuses.MissingRequiredField(["gameid"])
            }
            gameid = gameid[1]
            let game;
            try {
                game = await this.fetchGame(gameid, res.locals.user.userid)
            } catch {
                throw new statuses.ResourcePermissionError()
            }
            try {
                let winner = await game.getGameWinner()
                success(new statuses.WinnerSuccess(winner))
            } catch (e) {
                throw new statuses.GenericErrorWrapper(e)
            }
        }))
        this.app.get("/:gameid/state", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let game:Game = await this.fetchGame(req.params.gameid, res.locals.user.userid)
            //let game = await this.isInGame(req.params.gameid, r.userid)
            let r = new statuses.GetStateSuccess({
                currentTurn: await game.turn(),
                finished: await game.isGameFinished()
            })
            if (r.finished){
                r.winner = await game.getGameWinner()
            }
               
            success(r)
        }))
        //This is for the logical test of the game.
        this.app.post("/:gameid/move", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            console.log("Got new move")
            let move = new models.RequestMove(req.body)
            let gameid = req.params.gameid
            if (!gameid || typeof move.x !== "number") {
                throw new statuses.MissingRequiredField(["gameid", "x"])
            }
            let game;
            try {
                game = await this.fetchGame(gameid, res.locals.user.userid)
            } catch {
                throw new statuses.ResourcePermissionError()
            }
            try {
                await game.makeMove(res.locals.user.userid, move.x)
                this.opts.bus.emit("moves" + gameid, move)
                success(new statuses.GenericSuccess())
            }
            catch (e) {
                console.log(e)
                throw new statuses.GenericErrorWrapper(e)
            }
        }))



    }

}
module.exports.route = "/games"
module.exports.description = "Game Handler"
module.exports.parent = require('../private')
module.exports.id = 7