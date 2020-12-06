import express from 'express'
import * as statuses from '../../../resources/APIStatus'
import * as models from '../../../models/models'
import * as APIHelpers from '../../../resources/APIHelpers'
import Game from '../../../resources/Game'
import { Database } from 'sqlite3'
module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
        
    }
    
    setupApplication() {

        //Gets all people in game
        this.app.get("/:gameid/match", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid, this.opts.gateway.db)
            if (!g){
                throw new statuses.ResourcePermissionError()
            }
            let m:models.DatabaseMatch = (await (new models.DatabaseMatch({matchid:await g.getMatchId()}).select({db:this.opts.gateway.db})))[0]
            console.log("Found Match!", m,await g.getMatchId())
            success(new statuses.GetMatchSuccess(m))

        }))
        this.app.get("/:gameid/players", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid, this.opts.gateway.db)
            if (!g){
                throw new statuses.ResourcePermissionError()
            }

            let r = new statuses.GetUsersSuccess((await g.getPlayers()).filter(r=>r>=0))           
    
            success(r)

        }))

        //Authorizes ws for observing move events
        this.app.post("/:gameid/moves/authorize", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid, this.opts.gateway.db)
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
        //Authorizes ws for viewing list of participants
        this.app.post("/:gameid/participants/authorize", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid, this.opts.gateway.db)
            if (!g){
                throw new statuses.ResourcePermissionError()
            }

            let r = new models.EventSubscription(req.body)
            r.topic = "participants" + req.params.gameid
            APIHelpers.VerifyProperties(r)
            
            let _this = this
            //Set this user as online
            g.tracker.update(res.locals.user.userid)

            this.opts.bus.promoteWS(res.locals.user, r.wsid, r.topic, r.responseTopic, {
                //Set the user as offline
                'disconnect': async (data, user, socket) => {
                    let game: Game = await APIHelpers.fetchGame(req.params.gameid, user.userid,this.opts.gateway.db)
                    game.tracker.delete(user.userid)
                    console.log("User has stopped watching the game.")
                    _this.opts.bus.emit("participants" + req.params.gameid, {})
                }
            })
            this.opts.bus.emit("participants" +  req.params.gameid, {})
            success(new statuses.GenericSuccess())

        }))
        //Get a list of all participants
        this.app.get("/:gameid/participants", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let g:Game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid,this.opts.gateway.db)
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
            let game = await APIHelpers.fetchGame(gameid, res.locals.user.userid,this.opts.gateway.db)
            let board = await game.getBoard()
            //console.log("Got board",board)
            success(new statuses.ResourceSuccess(board))

        }))
        this.app.post("/:gameid/resign", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {

            let gameid = req.params.gameid
            let game:Game = await APIHelpers.fetchGame(gameid, res.locals.user.userid, this.opts.gateway.db)

            if (!game){
                throw new statuses.ResourcePermissionError();
            }
            //Prevent Other users from repeatedly resigning to boost points for other users
            if (await game.isGameFinished()){
                throw new statuses.GameStateSuccess(1)
            }
            
            let winners = await game.getUsersWhoArent(res.locals.user.userid)
            console.log()
            game.finishGame(winners[0])
            

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
            let acc = await new models.DatabaseMatchAcceptance({matchid:await game.getMatchId()}).select({db:this.opts.gateway.db})
            for (let p of acc){
                this.opts.bus.emit("user"+p.userid,{})
            }

        }))
        this.app.get("/:gameid/turn", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let gameid = (req.params.gameid || "").match(/(\d*)/)
            if (!gameid || !gameid[1]) {
                throw new statuses.MissingRequiredField(["gameid"])
            }
            gameid = gameid[1]
            let game;
            try {
                game = await APIHelpers.fetchGame(gameid, res.locals.user.userid,this.opts.gateway.db)
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
            
            if (!await APIHelpers.isInGame(req.params.gameid, r.userid,this.opts.gateway.db)){
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
            let game:Game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid,this.opts.gateway.db)
            //let game = await APIHelpers.isInGame(req.params.gameid, r.userid,this.opts.gateway.db)
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
            let game:Game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid,this.opts.gateway.db)
            //let game = await APIHelpers.isInGame(req.params.gameid, r.userid,this.opts.gateway.db)

            if (!game){
                throw new statuses.ResourcePermissionError()
            }
            this.opts.bus.promoteWS(res.locals.user, r.wsid, r.topic, r.responseTopic)
            
            success(new statuses.GenericSuccess())
            //Get All Request
        }))
        this.app.get("/:gameid/state", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let game:Game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid,this.opts.gateway.db)
            //let game = await APIHelpers.isInGame(req.params.gameid, r.userid,this.opts.gateway.db)
            let r = new statuses.GetStateSuccess({
                currentTurn: await game.turn(),
                finished: await game.isGameFinished()
            })
            if (r.finished){
                r.winner = await game.getGameWinner()
            }
               
            success(r)
        }))

        this.app.post("/:gameid/move", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            console.log("Got new move")
            let move = new models.RequestMove(req.body)
            let gameid = req.params.gameid
            if (!gameid || typeof move.x !== "number") {
                throw new statuses.MissingRequiredField(["gameid", "x"])
            }
            let game;
            try {
                game = await APIHelpers.fetchGame(gameid, res.locals.user.userid, this.opts.gateway.db)
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
        this.app.get("/:gameid/moves", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let game:Game;
            try {
                game = await APIHelpers.fetchGame(req.params.gameid, res.locals.user.userid, this.opts.gateway.db)
            } catch {
                throw new statuses.ResourcePermissionError()
            }
            let moves = await new models.DatabaseMove({gameid: game.gameId}).select({db:this.opts.gateway.db})
            success(new statuses.IncrementalMovesSuccess(moves))
            
        }))



    }

}
module.exports.route = "/games"
module.exports.description = "Game Handler"
module.exports.parent = require('../private')
module.exports.id = 7