import express from 'express'
import Game from '../../../../resources/Game'
import * as APIHelpers from '../../../../resources/APIHelpers'
import { AcceptAllError, AcceptAllSuccess, MatchCreateError, MatchCreationSuccess, PromoteError, PromotionSuccess } from '../../../../resources/APIStatus'

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
        this.app.post("/request/:request/accept", (req, res) => {
            let request = req.params.request
            //accept Request
        })
        this.app.post("/request/:request/deny", (req, res) => {
            let request = req.params.request
            //deny Request
        })
        this.app.post("/request/accept", (req, res) => {
            let request = req.query.id
            //accept Request
        })
        this.app.post("/request/deny", (req, res) => {
            let request = req.query.id
            //accept Request
        })
        this.app.post("/", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            try {
                let game = await Game.createMatch([res.locals.user.userid], res.locals.user.userid, 0, true, this.opts.gateway.db)
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
        this.app.post("/:matchid/promote", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            try{
            let matchid = req.params.matchid
            let game = await Game.startGame(matchid, this.opts.gateway.db)
            success(new PromotionSuccess(game))
        } catch{
                throw new PromoteError()
            }

        }))
    }

}
module.exports.route = "/requests"
module.exports.description = "Pending Game Handler"
module.exports.parent = require('../games')
module.exports.id = 8