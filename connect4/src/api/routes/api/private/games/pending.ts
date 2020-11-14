import express from 'express'
import Game from '../../../../resources/Game'
import * as APIHelpers from '../../../../resources/APIHelpers'
import { AcceptAllError, AcceptAllSuccess, MatchCreateError, MatchCreationSuccess, PromoteError, PromotionSuccess } from '../../../../resources/APIStatus'
import { MatchStatusChangeRequest, RequestMatch } from '../../../../models/models'

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
        this.app.get("/", (req, res) => {
            //Get All Request
        })
        this.app.get("/request/:request", (req, res) => {
            let request = req.params.request
            let denied = req.params.denied
            //Get Request
        })
        
        this.app.post("/", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new RequestMatch(req.body)
            let s = new Set([res.locals.user.userid].concat(r.participants))
            r.participants = Array.from(s)
            
            APIHelpers.VerifyProperties(r)
            try {
                let game = await Game.createMatch(r.participants, res.locals.user.userid, 0, r.computer, this.opts.gateway.db)
                success(new MatchCreationSuccess(game))
            } catch {
                throw new MatchCreateError();
            }

        }))
        this.app.post("/:matchid/acceptAll", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            try {
                let matchid = req.params.matchid
                let game = await Game.acceptGame(matchid, this.opts.gateway.db)
                success(new AcceptAllSuccess())
            } catch {
                throw new AcceptAllError()
            }
        }))
        this.app.post("/:matchid/response",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new MatchStatusChangeRequest(req.body)
            r.matchid = req.params.matchid
            APIHelpers.VerifyProperties(r)
            try {
                //No ownership validation needed, query prevents user from changing things that aren't thiers.
                await Game.setResponse(res.locals.user.userid, r.matchid, r.status,this.opts.gateway.db)
                success(new AcceptAllSuccess())
            } catch {
                throw new AcceptAllError()
            }
        }))
        
        this.app.post("/:matchid/promote", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            try{
            let matchid = req.params.matchid
            let game = await Game.startGame(matchid, this.opts.gateway.db)
            success(new PromotionSuccess(game))
        } catch(e){
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