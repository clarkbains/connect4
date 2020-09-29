"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
exports.default = {
    passwordRegex: /.{8,150}/i,
    JWTSigner: "fc4853aca422a3e389fa7f1ef101ab0b783d44e366d42f04e8dca92fd2e8c5bb5e612c506de91d07104dd548374d8a28969cfa152170007d7483140a9316890c",
    dbFile: path.resolve(__dirname, "..", "..", "..", "db", "test")
};
