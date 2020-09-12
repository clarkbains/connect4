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
        this.app.get("/test",(req, res)=>{
            res.send("Testme Good!")
            
        })
    } 

}
module.exports.route = "/testme"
module.exports.description = "Test Service"
module.exports.parent = require('../private')
module.exports.id = 2