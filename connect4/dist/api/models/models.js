"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.assign = exports.PragmaTableInfo = exports.DatabaseMatchAcceptance = exports.DatabaseMatch = exports.DatabaseMove = exports.DatabaseGameMessage = exports.DatabaseGame = exports.DatabaseCredential = exports.DatabaseUser = exports.DatabasePendingFriend = exports.DatabaseFriend = exports.UserModifyRequest = exports.LoginRequest = exports.RequestPasswordReset = exports.RequestPasswordChangeToken = exports.RequestPasswordChangePassword = exports.RequestPasswordChange = exports.ResponseMatch = exports.RequestResponseMatch = exports.RequestMatch = exports.ResponseGameIncremental = exports.ResponseGameWhole = exports.ResponseGameBasic = exports.ResponseMove = exports.RequestUser = exports.PublicResponseUser = exports.ResponseUser = void 0;
var databaseHelpers_1 = require("../resources/databaseHelpers");
var statuses = __importStar(require("../resources/APIStatus"));
var Request = (function () {
    function Request() {
    }
    Request.prototype.verifyProperties = function () {
        if (!this.verify) {
            console.error("Verify Called for Model with no verify attribute", this);
        }
        else {
            var res = this.verify();
            console.log("Verify", this, res);
            if (!res) {
                throw new statuses.FieldsNotValidated();
            }
        }
        return this;
    };
    return Request;
}());
var ResponseUser = (function () {
    function ResponseUser(u) {
        this.userid = u.userid;
        this.name = u.name;
        this.email = u.email;
        this.score = u.score;
        this.isEditable = u.isEditable || true;
    }
    return ResponseUser;
}());
exports.ResponseUser = ResponseUser;
var PublicResponseUser = (function () {
    function PublicResponseUser(u) {
        this.userid = u.userid;
        this.name = u.name;
        this.email = u.email;
        this.score = u.score;
    }
    return PublicResponseUser;
}());
exports.PublicResponseUser = PublicResponseUser;
var RequestUser = (function () {
    function RequestUser(u) {
        this.userid = u.userid;
        this.email = u.email;
        this.name = u.string;
        this.username = u.username;
        this.private = u.private;
    }
    return RequestUser;
}());
exports.RequestUser = RequestUser;
var ResponseMove = (function () {
    function ResponseMove(m) {
        this.moveid = m.moveid;
        this.x = m.x;
        this.y = m.y;
        this.userid = m.userid;
        this.time = m.time;
        this.gameid = m.gameid;
    }
    return ResponseMove;
}());
exports.ResponseMove = ResponseMove;
var ResponseGameBasic = (function () {
    function ResponseGameBasic(g) {
        this.gameid = g.gameid;
        this.name = g.name;
        this.size = g.size;
        this.players = g.players;
        this.currentTurn = g.currentTurn;
        this.gameWon = g.gameWon;
        this.score = g.score;
    }
    return ResponseGameBasic;
}());
exports.ResponseGameBasic = ResponseGameBasic;
var ResponseGameWhole = (function (_super) {
    __extends(ResponseGameWhole, _super);
    function ResponseGameWhole(g) {
        var _this = _super.call(this, g) || this;
        _this.state = g.state;
        return _this;
    }
    return ResponseGameWhole;
}(ResponseGameBasic));
exports.ResponseGameWhole = ResponseGameWhole;
var ResponseGameIncremental = (function (_super) {
    __extends(ResponseGameIncremental, _super);
    function ResponseGameIncremental(g) {
        var _this = _super.call(this, g) || this;
        _this.move = g.move;
        return _this;
    }
    return ResponseGameIncremental;
}(ResponseGameBasic));
exports.ResponseGameIncremental = ResponseGameIncremental;
var RequestMatch = (function () {
    function RequestMatch(m) {
        this.size = m.size;
        this.name = m.name;
        this.participants = m.participants;
    }
    return RequestMatch;
}());
exports.RequestMatch = RequestMatch;
var RequestResponseMatch = (function () {
    function RequestResponseMatch(a) {
        this.matchid = a.matchid;
        this.accepted = a.accepted;
        this.msg = a.msg;
    }
    return RequestResponseMatch;
}());
exports.RequestResponseMatch = RequestResponseMatch;
var ResponseMatch = (function () {
    function ResponseMatch(m) {
        this.matchid = m.matchid;
        this.msg = m.msg;
        this.accepted = m.accepted;
        this.gameid = m.gameid;
        this.name = m.name;
        this.size = m.size;
        this.participants = m.participants;
    }
    return ResponseMatch;
}());
exports.ResponseMatch = ResponseMatch;
var RequestPasswordChange = (function () {
    function RequestPasswordChange(p) {
        this.newpassword = p.newpassword;
        this.email = p.email;
        this.username = p.username;
    }
    return RequestPasswordChange;
}());
exports.RequestPasswordChange = RequestPasswordChange;
var RequestPasswordChangePassword = (function (_super) {
    __extends(RequestPasswordChangePassword, _super);
    function RequestPasswordChangePassword(p) {
        var _this = _super.call(this, p) || this;
        _this.oldpassword = p.oldpassword;
        return _this;
    }
    return RequestPasswordChangePassword;
}(RequestPasswordChange));
exports.RequestPasswordChangePassword = RequestPasswordChangePassword;
var RequestPasswordChangeToken = (function (_super) {
    __extends(RequestPasswordChangeToken, _super);
    function RequestPasswordChangeToken(p) {
        var _this = _super.call(this, p) || this;
        _this.token = p.token;
        return _this;
    }
    return RequestPasswordChangeToken;
}(RequestPasswordChange));
exports.RequestPasswordChangeToken = RequestPasswordChangeToken;
var RequestPasswordReset = (function (_super) {
    __extends(RequestPasswordReset, _super);
    function RequestPasswordReset(p) {
        var _this = _super.call(this) || this;
        _this.email = p.email;
        _this.username = p.username;
        return _this;
    }
    RequestPasswordReset.prototype.verify = function () {
        return this.email || this.username;
    };
    return RequestPasswordReset;
}(Request));
exports.RequestPasswordReset = RequestPasswordReset;
var LoginRequest = (function () {
    function LoginRequest(l) {
        this.email = l.email;
        this.password = l.password;
        this.username = l.username;
    }
    return LoginRequest;
}());
exports.LoginRequest = LoginRequest;
var UserModifyRequest = (function () {
    function UserModifyRequest(c) {
        this.name = c.name;
        this.email = c.email;
        this.username = c.username;
        this.private = c.private;
    }
    return UserModifyRequest;
}());
exports.UserModifyRequest = UserModifyRequest;
var DatabaseFriend = (function (_super) {
    __extends(DatabaseFriend, _super);
    function DatabaseFriend(f) {
        var _this = _super.call(this, "Friends") || this;
        _this.friendid = f.friendid;
        _this.user1 = f.user1;
        _this.user2 = f.user2;
        return _this;
    }
    return DatabaseFriend;
}(databaseHelpers_1.DatabaseModel));
exports.DatabaseFriend = DatabaseFriend;
var DatabasePendingFriend = (function (_super) {
    __extends(DatabasePendingFriend, _super);
    function DatabasePendingFriend(p) {
        var _this = _super.call(this, "PendingFriends") || this;
        _this.pendingfriendid = p.pendingfriendid;
        _this.user1 = p.user1;
        _this.user2 = p.user2;
        _this.msg = p.msg;
        return _this;
    }
    return DatabasePendingFriend;
}(databaseHelpers_1.DatabaseModel));
exports.DatabasePendingFriend = DatabasePendingFriend;
var DatabaseUser = (function (_super) {
    __extends(DatabaseUser, _super);
    function DatabaseUser(u) {
        var _this = _super.call(this, "Users") || this;
        _this.userid = u.userid;
        _this.name = u.name;
        _this.username = u.username;
        _this.email = u.email;
        _this.score = u.score;
        _this.private = u.private;
        return _this;
    }
    return DatabaseUser;
}(databaseHelpers_1.DatabaseModel));
exports.DatabaseUser = DatabaseUser;
var DatabaseCredential = (function (_super) {
    __extends(DatabaseCredential, _super);
    function DatabaseCredential(d) {
        var _this = _super.call(this, "Credentials") || this;
        _this.credentialid = d.credentialid;
        _this.userid = d.userid;
        _this.salt = d.salt;
        _this.hash = d.hash;
        return _this;
    }
    return DatabaseCredential;
}(databaseHelpers_1.DatabaseModel));
exports.DatabaseCredential = DatabaseCredential;
var DatabaseGame = (function (_super) {
    __extends(DatabaseGame, _super);
    function DatabaseGame(g) {
        var _this = _super.call(this, "Game") || this;
        _this.gameid = g.gameid;
        _this.matchid = g.matchid;
        _this.currentturn = g.currentturn;
        _this.gamefinished = g.gamefinished;
        _this.score = g.score;
        return _this;
    }
    return DatabaseGame;
}(databaseHelpers_1.DatabaseModel));
exports.DatabaseGame = DatabaseGame;
var DatabaseGameMessage = (function (_super) {
    __extends(DatabaseGameMessage, _super);
    function DatabaseGameMessage(g) {
        var _this = _super.call(this, "GameMessages") || this;
        _this.gamemessageid = g.gamemessageid;
        _this.gameid = g.gameid;
        _this.userid = g.userid;
        _this.msg = g.msg;
        _this.time = g.time;
        return _this;
    }
    return DatabaseGameMessage;
}(databaseHelpers_1.DatabaseModel));
exports.DatabaseGameMessage = DatabaseGameMessage;
var DatabaseMove = (function (_super) {
    __extends(DatabaseMove, _super);
    function DatabaseMove(m) {
        var _this = _super.call(this, "Moves") || this;
        _this.moveid = m.moveid;
        _this.gameid = m.gameid;
        _this.x = m.x;
        _this.y = m.y;
        _this.time = m.time;
        return _this;
    }
    return DatabaseMove;
}(databaseHelpers_1.DatabaseModel));
exports.DatabaseMove = DatabaseMove;
var DatabaseMatch = (function (_super) {
    __extends(DatabaseMatch, _super);
    function DatabaseMatch(m) {
        var _this = _super.call(this, "Matchs") || this;
        _this.matchid = m.matchid;
        _this.userid = m.userid;
        _this.width = m.width;
        _this.height = m.height;
        _this.participants = m.participants;
        _this.msg = m.msg;
        _this.name = m.name;
        _this.status = m.status;
        return _this;
    }
    return DatabaseMatch;
}(databaseHelpers_1.DatabaseModel));
exports.DatabaseMatch = DatabaseMatch;
var DatabaseMatchAcceptance = (function (_super) {
    __extends(DatabaseMatchAcceptance, _super);
    function DatabaseMatchAcceptance(ma) {
        var _this = _super.call(this, "MatchAcceptances") || this;
        _this.matchid = ma.matchid;
        _this.userid = ma.userid;
        _this.status = ma.status;
        _this.msg = ma.msg;
        _this.matcchacceptanceid = ma.matcchacceptanceid;
        return _this;
    }
    return DatabaseMatchAcceptance;
}(databaseHelpers_1.DatabaseModel));
exports.DatabaseMatchAcceptance = DatabaseMatchAcceptance;
var PragmaTableInfo = (function () {
    function PragmaTableInfo(p) {
        this.cid = p.cid;
        this.name = p.name;
        this.type = p.type;
        this.notnull = p.notnull;
        this.dflt_value = p.dflt_value;
        this.pk = p.pk;
    }
    return PragmaTableInfo;
}());
exports.PragmaTableInfo = PragmaTableInfo;
exports.assign = function (data, model, verify) {
    function assignAndVerify(row) {
        var res = new model(row);
        if (res.verify) {
            if (!res.verify(verify)) {
                throw new Error("Didn't pass verification");
            }
        }
        return res;
    }
    if (Array.isArray(data)) {
        return data.map(function (row) { return assignAndVerify(row); });
    }
    return assignAndVerify(data);
};
exports.compare = function (oldData, newData) {
    var e_1, _a;
    var diffs = [];
    var propertyList = __spread(new Set(__spread(Object.keys(oldData), Object.keys(newData))));
    try {
        for (var propertyList_1 = __values(propertyList), propertyList_1_1 = propertyList_1.next(); !propertyList_1_1.done; propertyList_1_1 = propertyList_1.next()) {
            var key = propertyList_1_1.value;
            if (key.startsWith("_"))
                continue;
            var o = oldData[key];
            o = oldData["_db_" + key] ? oldData["_db_" + key](o) : o;
            var n = newData[key];
            n = newData["_db_" + key] ? newData["_db_" + key](n) : n;
            if (n !== o) {
                diffs.push({
                    key: key,
                    from: o,
                    to: n
                });
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (propertyList_1_1 && !propertyList_1_1.done && (_a = propertyList_1.return)) _a.call(propertyList_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return diffs;
};
