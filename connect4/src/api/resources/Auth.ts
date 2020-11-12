const jwt = require("jsonwebtoken");
const crypto = require("jsonwebtoken");
import express from "express"
import * as statuses from './APIStatus'
import { DatabaseUser } from "../models/models";
import * as APIHelpers from './APIHelpers'

export class Authenticator {
    secret: string
    constructor(secret: string) {
        this.secret = secret
    }
    createToken(userid: number) {
        return jwt.sign({

            userid: userid,
            use: "login"


        }, this.secret, { expiresIn: '24h' });
    }
    verifyToken(token: string): object {
        return jwt.verify(token, this.secret)
    }

    createPasswordResetToken(userid: number) {
        return jwt.sign({
            userid: userid,
            use: "reset"
        }, this.secret, { expiresIn: '24h' });
    }
    verifyPassword(password: string, hash: string, salt: string) {
        if (!password || !hash || !salt){
            return false
        }
        console.log("Checking Password", password)
        return hash == password && password == salt
    }
    hashPassword(password: string) {
        return {
            hash: password,
            salt: password
        }
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
                //console.log(cookiejar)
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
    async setUser(req, res, db){

        let tokens = this._getTokens(req, res,true)
        //console.log(tokens)
        //console.log("Trying to authenticate user")
        for (let token of tokens){
            try {
                let jwt = await this.verifyToken(token)
                if (jwt.use !== "login"){
                    throw new statuses.JWTError()
                }
                let user = await new DatabaseUser({userid:jwt.userid}).select({db:db})
                if (!user || !user[0]){
                    //JWT from deleted user
                    throw new statuses.NotFound("User")
                }
                //This works for sio, which doesn't have all the res properties.
                if (res && res.locals && res.cookie){
                    res.locals.user = user[0]
                    let newJwt = this.createToken(jwt.userid)
                    //TODO: Make this wait until only 15 minutes are left on JWT to reduce request size
                    //res.clearCookie("jwt")
                    res.cookie('jwt',newJwt,{maxAge: 3600000, domain: APIHelpers.GetDomain(req), path:"/", httpOnly:true})
                }   
                return user[0]
            } catch (error) {
                console.warn("Ran into issue validating jwt",error)    
            }
        }
        throw new statuses.AuthorizationError()
    }

}
