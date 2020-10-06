
import express from 'express'
import { RequestUser, UserModifyRequest, DatabaseUser } from '../../../models/models'
import * as APIHelpers from '../../../resources/APIHelpers'
import * as statuses from '../../../resources/APIStatus'
import { DatabaseModel } from '../../../resources/databaseHelpers'


module.exports = class {
    app:express.Application
    opts:object
    constructor(opts:object){
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication(){
        this.app.get("/me", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
           let resp = new statuses.GetUserSuccess(new RequestUser(res.locals.user))
           console.log(resp)
            success(resp)
        }))
        this.app.get("/:userid",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new DatabaseUser({userid:req.params.userid})
            let u = await r.select({db: this.opts.gateway.db});
            if (u.length==0){
                throw new statuses.NotFound("User")
            }
            let resp = new statuses.GetUserSuccess(new RequestUser(u[0]))
            console.log(resp)
             success(resp)
         }))
        
        
        this.app.patch("/me",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let modified = new UserModifyRequest(req.body)
            Object.assign(res.locals.user, modified)
            await res.locals.user.update({db:this.opts.gateway.db})
            .catch(e=> {throw new statuses.DatabaseError()})
            res.send(modified)
         }))
         this.app.delete("/me",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            await res.locals.user.delete({db:this.opts.gateway.db})
            .catch(e=> {throw new statuses.DatabaseError()})
            res.send(new statuses.DeleteSuccess("User"))
         }))
 
    } 
}
module.exports.route = "/user"
module.exports.description = "RUD User Profiles"
module.exports.parent = require('../private')
module.exports.id = 3