"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticator = void 0;
var jwt = require("jsonwebtoken");
var crypto = require("jsonwebtoken");
var Authenticator = (function () {
    function Authenticator(secret) {
        this.secret = secret;
    }
    Authenticator.prototype.createToken = function (userid) {
        return jwt.sign({
            userid: userid,
            use: "login"
        }, this.secret, { expiresIn: '24h' });
    };
    Authenticator.prototype.verifyToken = function (token) {
        return jwt.verify(token, this.secret);
    };
    Authenticator.prototype.createPasswordResetToken = function (userid) {
        return jwt.sign({
            userid: userid,
            use: "reset"
        }, this.secret, { expiresIn: '24h' });
    };
    Authenticator.prototype.verifyPassword = function (password, hash, salt) {
        if (!password || !hash || !salt) {
            return false;
        }
        console.log("Checking Password", password);
        return hash == password && password == salt;
    };
    Authenticator.prototype.hashPassword = function (password) {
        return {
            hash: password,
            salt: password
        };
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;
