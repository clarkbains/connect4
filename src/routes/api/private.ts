import express from "express";
import AuthorizationError from "../../resources/errors/AuthorizationError";

module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication() {
        this.app.use((req: express.Request, res: express.Response, next: Function) => {
            let tokens = this._getTokens(req, res,true)
            for (let token of tokens){
                try {
                    let userid = this.opts.auth.verifyToken(token)
                    req.user = {id:userid}
                    let newJwt = this.opts.auth.createToken(userid)
                    //TODO: Make this wait until only 15 minutes are left on JWT to reduce request size
                    res.clearCookie("jwt")
                    //Didn't work with curl, will wait to see if it works better in browser
                    //Should be set as http only after testing
                    res.cookie('jwt',newJwt,{maxAge: 3600000, domain: "127.0.0.1", path:"/"})
                    return next()
                } catch (error) {
                    console.log("Encountered Invalid JWT", error)
                }
            }
            res.send(new AuthorizationError())
        })
    }

    _getTokens(req: express.Request, res: express.Response, allowOther: boolean): string[] {
        //Basically check a crap ton of places and then get an array of possible JWT tokens
        let jwt: (string | undefined)[] = []
        if (allowOther) {
            if (req && req.body && req.body.jwt) {
                jwt.push(req.body.jwt)
            }
            if (req && req.headers && req.headers["cookie"]) {
                let cookiejar = new Map<string, string>()
                req.headers["cookie"].split(';').forEach(cookie => {
                    var parts = cookie.split('=');
                    cookiejar.set(parts.shift().trim().toLowerCase(), decodeURI(parts.join('=')));
                });
                console.log(cookiejar)
                jwt.push(cookiejar.get("x-auth"))
                jwt.push(cookiejar.get("jwt"))
            }
            if (req.query) {
                jwt.push(req.query.jwt)
                jwt.push(req.query.bearer)
            }
        }
        if (req && req.headers && req.headers["authorization"]) {
            let header = req.headers["authorization"]
            let match = header.match(/^bearer:\s(.*)$/i)
            if (match && match[1]) {
                header = match[1]
            }
            jwt.push(header)
        }


        return jwt.filter(elm => !!elm)
    }


}
module.exports.route = "/private"
module.exports.description = "Checks JWTS"
module.exports.parent = require('../api')
module.exports.id = 1