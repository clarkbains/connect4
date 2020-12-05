import express from 'express'
import Game from '../../../../resources/Game'
import * as APIHelpers from '../../../../resources/APIHelpers'
import { AcceptAllError, AcceptAllSuccess, CouldNotFindMatch, JoinSuccess, MatchCreateError, MatchCreationSuccess, PromoteError, PromotionSuccess } from '../../../../resources/APIStatus'
import { DatabaseGame, JoinOpenMatch, MatchStatusChangeRequest, RequestMatch } from '../../../../models/models'

module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()

    }
    async denyRequest(id: number) {

    }
    async accept(id: number) {

    }
    setupApplication() {
        /*this.app.get("/", (req, res) => {
            //Get All Request
        })
        this.app.get("/request/:request", (req, res) => {
            let request = req.params.request
            let denied = req.params.denied
            //Get Request
        })*/

        this.app.post("/", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new RequestMatch(req.body)
            let s = new Set([res.locals.user.userid].concat(r.participants))
            r.participants = Array.from(s)

            APIHelpers.VerifyProperties(r)
            try {
                //let game = await Game.createMatch(2, r.participants, res.locals.user.userid, 0, r.computer, this.opts.gateway.db)
                let game = await Game.createMatch(r.name, r.participants, res.locals.user.userid, r.privacy, this.opts.gateway.db)
                success(new MatchCreationSuccess(game))
            } catch (e) {
                console.log(e)
                throw new MatchCreateError();
            }

        }))
        this.app.post("/join", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new JoinOpenMatch(req.body)
            console.log(r, req.body)
            APIHelpers.VerifyProperties(r)

            let game = await Game.findMatchingMatchId(res.locals.user.userid, r.privacy, this.opts.gateway.db)
            if (game === undefined) {
                throw new CouldNotFindMatch()
            }
            console.log("Found Good Match", game)
            success(new JoinSuccess(game))


        }))
        /*this.app.post("/:matchid/acceptAll", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            try {
                let matchid = req.params.matchid
                let game = await Game.acceptGame(matchid, this.opts.gateway.db)
                success(new AcceptAllSuccess())
            } catch {
                throw new AcceptAllError()
            }
        }))*/
        this.app.post("/:matchid/response", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new MatchStatusChangeRequest(req.body)
            r.matchid = req.params.matchid
            APIHelpers.VerifyProperties(r)

            //No ownership validation needed, query prevents user from changing things that aren't thiers.
            let startedGames = await (new DatabaseGame({ matchid: r.matchid })).select({ db: this.opts.gateway.db })
            if (startedGames.length > 0) {
                //Game has already been promoted
                throw new Error("Match Has already been promoted")
            }
            try {
                await Game.setResponse(res.locals.user.userid, r.matchid, r.status, this.opts.gateway.db)
                success(new AcceptAllSuccess())
            } catch (e) {
                console.error(e)
                throw new AcceptAllError()
            }
        }))

        this.app.post("/:matchid/promote", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            try {
                let matchid = req.params.matchid
                let game = await Game.startGame(matchid, this.opts.gateway.db)
                success(new PromotionSuccess(game))
            } catch (e) {
                console.log(e)
                throw new PromoteError()
            }

        }))
    }

}
module.exports.route = "/requests"
module.exports.description = "Pending Game Handler"
module.exports.parent = require('../games')
module.exports.id = 8