import express from 'express'
import * as statuses from '../../../resources/APIStatus'
import * as models from '../../../models/models'
import * as APIHelpers from '../../../resources/APIHelpers'
module.exports = class {
    app:express.Application
    opts:object
    constructor(opts:object){
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication(){
        this.app.get("/",(req, res)=>{
            let detail = req.query.detail
            let active = req.query.active
            let won = req.query.won
            //Get Games
            throw new statuses.ResourcePermissionError()
        })
        this.app.get("/game/:gameid",(req, res)=>{
            //let detail = req.query.detail
            let gameid = req.params.gameid 
            //Get Games
        })
        this.app.get("/:gameid/moves",(req, res)=>{
            let gameid = req.params.gameid 
            let mode =   req.query.mode
            //Get Game moves
        })
        this.app.post("/:gameid/moves",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            console.log("Got new move")
            let move = new models.RequestMove(req.body)
            console.log(move)

            move.userid = res.locals.user.userid
            console.log(move)

            move.gameid = req.params.gameid 
            console.log(move)

            console.log(move)
            function rand (l,h){
                return Math.floor(Math.random() * (h - l) + l)
            }
            let resp = new models.ResponseMove(move)
            resp.y = rand(1,9)
            success(resp)
            //Make Game moves

        }))
        this.app.post("/game",(req, res)=>{
            //let detail = req.query.detail
            let opponents:number[] = req.body.opponents
            let size:number = req.body.size 
            //Get Games
        })

        this.app.use((error:statuses.APIError,req:express.Request,res:express.Response,next:express.NextFunction)=>{
            //res.status(error.code).send(error)
        })
    } 

}
module.exports.route = "/games"
module.exports.description = "Game Handler"
module.exports.parent = require('../private')
module.exports.id = 7