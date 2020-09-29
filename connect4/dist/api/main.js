"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var e_1, _a;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var bodyParser = require('body-parser');
var glob = require('glob');
var path = require('path');
var mw = require('./middleware');
var app = express_1.default();
var Auth_1 = require("./resources/Auth");
var Gw = require('./gateway');
var config_1 = __importDefault(require("./config"));
var opts = {
    auth: new Auth_1.Authenticator(config_1.default.JWTSigner),
    gateway: new Gw(config_1.default.dbFile, false),
    conf: config_1.default
};
app.use(bodyParser.json());
var apps = new Map();
glob.sync(path.join(__dirname, '/routes/') + '**/*.js').forEach(function (file) {
    try {
        var handlerC = require(path.resolve(file));
        apps.set(handlerC.id, handlerC);
    }
    catch (e) {
        console.warn(e);
    }
});
var maxid = 0;
try {
    for (var _b = __values(apps.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        if (maxid < apps.get(key).id) {
            maxid = apps.get(key).id;
        }
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    }
    finally { if (e_1) throw e_1.error; }
}
console.debug("Next Route id is " + (maxid + 1));
treeRoutes(apps, 0, app);
app.use(mw.noRouteMiddleware).use(mw.errorMiddleware);
app.listen(9000);
console.log("Application has started");
function treeRoutes(routes, parentId, currentApplcation, depth) {
    var e_2, _a;
    if (depth === void 0) { depth = 0; }
    if (depth === 0) {
        console.log("Treeing Routes");
    }
    try {
        for (var _b = __values(routes.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var element = _c.value;
            var currRoute = routes.get(element);
            if (parentId.toString() == (currRoute.parent.id || 0)) {
                var d = "";
                for (var i = 0; i < depth; i++) {
                    d += "\t";
                }
                console.log(d + " " + currRoute.route + " (" + currRoute.description + ")");
                try {
                    var r = new currRoute(opts);
                    treeRoutes(routes, currRoute.id, r.app, depth + 1);
                    if (currRoute.route)
                        currentApplcation.use(currRoute.route, r.app);
                    else
                        currentApplcation.use(r.app);
                }
                catch (e) {
                    console.warn("An Error Occurred while adding the previous handler", e);
                }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
module.exports.id = 0;
