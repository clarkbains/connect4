import express from 'express'

module.exports = class {
    app:express.Application
    opts:object
    constructor(opts:object){
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    async denyRequest(id:number){

    }
    async accept(id:number){
        
    }
    setupApplication(){
        this.app.get("/",(req, res)=>{
            //Get All Request
        })
        this.app.get("/request/:request",(req, res)=>{
            let request = req.params.request
            let denied = req.params.denied
            //Get Request
        })
        this.app.post("/request/:request/accept",(req, res)=>{
            let request = req.params.request
            //accept Request
        })
        this.app.post("/request/:request/deny",(req, res)=>{
            let request = req.params.request
            //deny Request
        })
        this.app.post("/request/accept",(req, res)=>{
            let request = req.query.id
            //accept Request
        })
        this.app.post("/request/deny",(req, res)=>{
            let request = req.query.id
            //accept Request
        })
        this.app.post("/",(req, res)=>{
            //let detail = req.query.detail
            let opponents:number[] = req.body.opponents
            let size:number = req.body.size 
            //Get Games
        })
    } 

}
module.exports.route = "/requests"
module.exports.description = "Pending Game Handler"
module.exports.parent = require('../games')
module.exports.id = 8