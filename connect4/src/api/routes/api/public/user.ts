import express from 'express'
import * as models from '../../../models/models'
import * as statuses from '../../../resources/APIStatus'
import * as APIHelpers from '../../../resources/APIHelpers'
module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }

    setupApplication() {
        this.app.get("/generate/:token", (req, res) => {
            console.log("generate")
            res.send(this.opts.auth.createToken(req.params.token))
        })

        this.app.post("/", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {


            let dbObj = new models.DatabaseUser(
                new models.UserModifyRequest(req.body)
            )
            APIHelpers.VerifyProperties(dbObj, "this.email && this.username")
            APIHelpers.DefaultProperties(dbObj, [
                ["name", "Anonymous Carrot"]
            ])
            await dbObj.insert({ db: this.opts.gateway.db })
                .catch(e => { throw new statuses.DatabaseError() })
            await success(new statuses.CreateUserSuccess())

        }))

        this.app.post("/login", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let loginRequest = new models.LoginRequest(req.body)
            let u = await new models.DatabaseUser(loginRequest).select({ db: this.opts.gateway.db })
            console.log("Found User for Login:",u)
            if (u.length == 0)
                throw new statuses.NotFound("User")
            let creds = await new models.DatabaseCredential(u[0]).select({ db: this.opts.gateway.db })
            if (creds.length == 0)
                throw new statuses.NoPasswordSet()
            console.log(creds)
            if (this.opts.auth.verifyPassword(loginRequest.password, creds[0].hash, creds[0].salt)) {
                let jwt = this.opts.auth.createToken(creds[0].userid)
                res.cookie('jwt', jwt, { maxAge: 3600000, domain: APIHelpers.GetDomain(req), path: "/" })
                return success(new statuses.LoginSuccess(jwt))
            }
            throw new statuses.CredentialError()

        }))

        this.app.post("/changepassword", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let myRequest: models.RequestPasswordChange = undefined
            let userid = undefined
            if (req.body.token) {
                let m = new models.RequestPasswordChangeToken(req.body)
                let body = {}
                try {
                    body = await this.opts.auth.verifyToken(m.token)
                } catch (e) {
                    throw new statuses.JWTError
                }
                console.log("Decoded JWT for password reset is ", body)
                if (body.use !== "reset")
                    throw new statuses.JWTError()
                userid = body.userid
                myRequest = m

            } else if (req.body.oldpassword) {
                let m = new models.RequestPasswordChangePassword(req.body)
                let u = await new models.DatabaseUser({ email: m.email, username: m.username }).select({ db: this.opts.gateway.db })
                if (u.length == 0)
                    throw new statuses.CredentialError()
                console.log("Got User requesting password reset ", u[0])
                userid = u[0].userid
                let c = await new models.DatabaseCredential({ userid: u[0].userid }).select({ db: this.opts.gateway.db })
                if (c.length == 0)
                    throw new statuses.NoPasswordSet()

                let passwordValid = this.opts.auth.verifyPassword(m.oldpassword, c[0].hash, c[0].salt)
                if (!passwordValid) {
                    throw new statuses.CredentialError()
                }
                myRequest = m
            }
            if (myRequest == undefined) {
                throw new statuses.BadPasswordResetRequest()
            }
            if (!myRequest.newpassword) {
                throw new statuses.MissingRequiredField(["newpassword"])
            }
            if (!myRequest.newpassword.match(this.opts.conf.passwordRegex)) {
                throw new statuses.PasswordValidationError()
            }


            let cred = this.opts.auth.hashPassword(myRequest.newpassword)
            let oldCreds = await new models.DatabaseCredential({ userid: userid })
                .select({ db: this.opts.gateway.db })
            console.log("Changing creds from",oldCreds)
            let updatedCreds = new models.DatabaseCredential(oldCreds[0]?oldCreds[0]:{})
            updatedCreds.hash = cred.hash
            updatedCreds.salt = cred.salt
            updatedCreds.userid = userid
            console.log(updatedCreds)
            if (oldCreds.length == 0){
                console.log("Inserting new User Creds",updatedCreds)
                await updatedCreds.insert({ db: this.opts.gateway.db })

            }
            else{
                console.log("Updating Current Creds",updatedCreds)
                await updatedCreds.update({ db: this.opts.gateway.db })

            }
            await success(new statuses.ChangePasswordSuccess)
        }))


        //TODO: Add mailgun Integration
        this.app.post("/sendresetemail", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let q = new models.RequestPasswordReset(req.body)
            console.log(q,r, req.body)
            q.verifyProperties()
            let r = new models.DatabaseUser(q)
            
            
            let user = await r.select({ db: this.opts.gateway.db })
            if (user.length == 0)
                throw new statuses.NotFound("User")
            let token = this.opts.auth.createPasswordResetToken(user[0].userid)
            success(new statuses.TokenDebugRequest(token))
        }
        )

        )
    }

}
module.exports.route = "/user"
module.exports.description = "CR User Profiles"
module.exports.parent = require('../public')
module.exports.id = 6