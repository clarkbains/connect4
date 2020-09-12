
import express from 'express'


module.exports = class {
    app:express.Application
    opts:object
    constructor(opts:object){
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication(){
        this.app.get("/me",async (req, res)=>{
           let x = await this.opts.gw.getUserById(req.user.id)
           res.send(x)
            
        })
        this.app.patch("/me",async (req, res)=>{
            let x = await this.opts.gw.getUserById(req.user.id)
            res.send(x)
         })
    } 

}
module.exports.route = "/user"
module.exports.description = "RUD User Profiles"
module.exports.parent = require('../private')
module.exports.id = 3