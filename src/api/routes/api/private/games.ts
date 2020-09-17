import express from 'express'
import * as statuses from '../../../resources/APIStatus'

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
        this.app.get("/game/:gameid/moves",(req, res)=>{
            let gameid = req.params.gameid 
            let mode =   req.query.mode
            //Get Game moves
        })
        this.app.post("/game/:gameid/moves",(req, res)=>{
            let gameid = req.params.gameid 
            //Make Game moves
        })
        this.app.post("/game",(req, res)=>{
            //let detail = req.query.detail
            let opponents:number[] = req.body.opponents
            let size:number = req.body.size 
            //Get Games
        })

        this.app.use((error:statuses.APIError,req:express.Request,res:express.Response,next:express.NextFunction)=>{
            res.status(error.code).send(error)
        })
    } 

}
module.exports.route = "/games"
module.exports.description = "Game Handler"
module.exports.parent = require('../private')
module.exports.id = 7