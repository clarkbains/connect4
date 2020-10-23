import express from 'express'
import * as statuses from '../../../resources/APIStatus'
import * as models from '../../../models/models'
import * as APIHelpers from '../../../resources/APIHelpers'
import Game from '../../../resources/Game'
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
    async fetchGame(gameid, userid) {
        let userAcceptances = await new models.DatabaseMatchAcceptance({
            userid: userid,
            status: 2,
        }).select({ db: this.opts.gateway.db })
        let matches = userAcceptances.map(e => { return e.matchid })
        //Throws error if the user doesn't play in the game.
        await new models.DatabaseGame({}).raw(this.opts.gateway.db,
            {
                sql: `SELECT * from Games where matchid in (${matches.map(e => "?").join(",")})`,
                params: matches,
                single: true,
            })

        if (this.games[gameid]) {
            return this.games[gameid]
        }
        this.games[gameid] = new Game(this.opts.gateway.db, gameid)
    }
    setupApplication() {
        this.app.get("/", (req, res) => {
            let detail = req.query.detail
            let active = req.query.active
            let won = req.query.won
            //Get Games
            throw new statuses.ResourcePermissionError()
        })
        this.app.get("/game/:gameid", (req, res) => {
            //let detail = req.query.detail
            let gameid = req.params.gameid
            //Get Games
        })
        this.app.get("/:gameid/moves", (req, res) => {
            let gameid = req.params.gameid
            let mode = req.query.mode
            //Get Game moves
        })
        this.app.get("/:gameid/board", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let gameid = req.params.gameid
            let game = await this.fetchGame(gameid,res.locals.userid)
            success(await game.getBoard())
        }))
        this.app.get("/:gameid/turn", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let gameid = req.params.gameid
            let game = await this.fetchGame(gameid,res.locals.userid)
            success(await game.turn(res.locals.userid))
        }))
        this.app.get("/:gameid/winner", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let gameid = req.params.gameid
            let game = await this.fetchGame(gameid,res.locals.userid)
            success(await game.getGameWinner())
        }))
        this.app.get("/:gameid/finished", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let gameid = req.params.gameid
            let game = await this.fetchGame(gameid,res.locals.userid)
            success(await game.isGameFinished())
        }))
        //This is for the logical test of the game.
        this.app.post("/:gameid/move", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            console.log("Got new move")
            let move = new models.RequestMove(req.body)
            let gameid = req.params.gameid
            let game = await this.fetchGame(gameid,res.locals.userid)
            success(await game.makeMove(res.locals.userid,move.x))
        }))

        //This is currently used for the demo of clicking on a cell on the interactive canvas
        this.app.post("/:gameid/moves", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            console.log("Got new move")
            let move = new models.RequestMove(req.body)
            console.log(move)

            move.userid = res.locals.user.userid
            console.log(move)
            move.gameid = req.params.gameid
            console.log(move)
            console.log(move)
            let resp = new models.ResponseMove(move)
            success(resp)
            //Make Game moves

        }))


        this.app.post("/game", (req, res) => {
            //let detail = req.query.detail
            let opponents: number[] = req.body.opponents
            let size: number = req.body.size
            //Get Games
        })

        this.app.use((error: statuses.APIError, req: express.Request, res: express.Response, next: express.NextFunction) => {
            //res.status(error.code).send(error)
        })
    }

}
module.exports.route = "/games"
module.exports.description = "Game Handler"
module.exports.parent = require('../private')
module.exports.id = 7