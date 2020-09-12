import express from 'express'
import FieldError from '../../../resources/errors/FieldError'

module.exports = class {
    app:express.Application
    opts:object
    constructor(opts:object){
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication(){
        this.app.get("/generate/:token",(req, res)=>{
            console.log("generate")
            res.send(this.opts.auth.createToken(req.params.token))
            
        })
        this.app.post("/",(req, res)=>{
            let createUser = req.body
        })
        this.app.post("/login",(req, res)=>{
            let loginRequest = req.body
        })

        this.app.post("/changepassword",(req, res)=>{
            let token = req.body.token
            let oldpassword = req.body.oldpassword || token
            let newpassword = req.body.newpassword
            if (!newpassword.match(this.opts.conf.passwordRegex)){
                throw new FieldError(new Map<string,string>([["password","password must be longer than 8 chars"]]))
            }
        })
        this.app.post("/sendresetemail",(req, res)=>{
            let loginRequest = req.body
        })
    } 

}
module.exports.route = "/user"
module.exports.description = "CR User Profiles"
module.exports.parent = require('../public')
module.exports.id = 6