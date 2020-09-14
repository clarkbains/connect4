const jwt = require("jsonwebtoken");
const crypto = require("jsonwebtoken");
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
        console.log("Checking Password", password)
        return hash == password
    }
    hashPassword(password: string) {
        return {
            hash: password,
            salt: "pepper"
        }
    }

}