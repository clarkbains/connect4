const jwt = require("jsonwebtoken");
module.exports = class Authenticator {
    secret:string
    constructor (secret:string){
        this.secret = secret
    }
    createToken (userid:number) {
        return jwt.sign({
            data: userid
          }, this.secret, { expiresIn: '1h' });
    }
    verifyToken (token:string):object {
        return jwt.verify(token, this.secret)
    }
}