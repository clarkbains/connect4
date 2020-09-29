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
exports.BadPasswordResetRequest = exports.UnknownError = exports.DatabaseError = exports.RouteError = exports.ResourcePermissionError = exports.PasswordValidationError = exports.NotFound = exports.FieldsNotValidated = exports.MissingRequiredField = exports.NoPasswordSet = exports.JWTError = exports.CredentialError = exports.FieldError = exports.AuthorizationError = exports.APIError = exports.DeleteSuccess = exports.LogoutSuccess = exports.GetUserSuccess = exports.LoginSuccess = exports.TokenDebugRequest = exports.ChangePasswordSuccess = exports.CreateUserSuccess = exports.APISuccess = exports.APIStatus = void 0;
var APIStatus = (function () {
    function APIStatus(cls, msg, info, code) {
        this.cls = cls;
        this.msg = msg;
        this.info = info;
        this.code = code;
    }
    APIStatus.prototype.toString = function () {
        return JSON.stringify({
            cls: this.cls,
            msg: this.msg,
            info: this.info
        });
    };
    return APIStatus;
}());
exports.APIStatus = APIStatus;
var APISuccess = (function (_super) {
    __extends(APISuccess, _super);
    function APISuccess(msg, info, code) {
        return _super.call(this, "success", msg, info, code ? code : 200) || this;
    }
    return APISuccess;
}(APIStatus));
exports.APISuccess = APISuccess;
var CreateUserSuccess = (function (_super) {
    __extends(CreateUserSuccess, _super);
    function CreateUserSuccess() {
        return _super.call(this, "account created", "please validate your email") || this;
    }
    return CreateUserSuccess;
}(APISuccess));
exports.CreateUserSuccess = CreateUserSuccess;
var ChangePasswordSuccess = (function (_super) {
    __extends(ChangePasswordSuccess, _super);
    function ChangePasswordSuccess() {
        return _super.call(this, "Password Changed", "please login again") || this;
    }
    return ChangePasswordSuccess;
}(APISuccess));
exports.ChangePasswordSuccess = ChangePasswordSuccess;
var TokenDebugRequest = (function (_super) {
    __extends(TokenDebugRequest, _super);
    function TokenDebugRequest(token) {
        var _this = _super.call(this, "Got Token", "Dev Token") || this;
        _this.token = token;
        return _this;
    }
    return TokenDebugRequest;
}(APISuccess));
exports.TokenDebugRequest = TokenDebugRequest;
var LoginSuccess = (function (_super) {
    __extends(LoginSuccess, _super);
    function LoginSuccess(jwt) {
        var _this = _super.call(this, "Logged In", "Please Make a request") || this;
        _this.token = jwt;
        return _this;
    }
    return LoginSuccess;
}(APISuccess));
exports.LoginSuccess = LoginSuccess;
var GetUserSuccess = (function (_super) {
    __extends(GetUserSuccess, _super);
    function GetUserSuccess(user) {
        var _this = _super.call(this, "Got User", "") || this;
        _this.user = user;
        return _this;
    }
    return GetUserSuccess;
}(APISuccess));
exports.GetUserSuccess = GetUserSuccess;
var LogoutSuccess = (function (_super) {
    __extends(LogoutSuccess, _super);
    function LogoutSuccess() {
        return _super.call(this, "Logged Out", "Your sessison tokens have been overwritten") || this;
    }
    return LogoutSuccess;
}(APISuccess));
exports.LogoutSuccess = LogoutSuccess;
var DeleteSuccess = (function (_super) {
    __extends(DeleteSuccess, _super);
    function DeleteSuccess(type) {
        return _super.call(this, "Deleted", type + " has been deleted") || this;
    }
    return DeleteSuccess;
}(APISuccess));
exports.DeleteSuccess = DeleteSuccess;
var APIError = (function (_super) {
    __extends(APIError, _super);
    function APIError(msg, info, code) {
        return _super.call(this, "error", msg, info, code) || this;
    }
    return APIError;
}(APIStatus));
exports.APIError = APIError;
var AuthorizationError = (function (_super) {
    __extends(AuthorizationError, _super);
    function AuthorizationError() {
        return _super.call(this, "Invalid Session", "You may need to sign in again", 401) || this;
    }
    return AuthorizationError;
}(APIError));
exports.AuthorizationError = AuthorizationError;
var FieldError = (function (_super) {
    __extends(FieldError, _super);
    function FieldError(invalidItems) {
        var e_1, _a;
        var _this = this;
        var messagePairs = [];
        try {
            for (var _b = __values(invalidItems.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                messagePairs.push("\"" + key + "\" " + invalidItems.get(key) + ".");
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        _this = _super.call(this, "Field Error", messagePairs.join(", "), 400) || this;
        return _this;
    }
    return FieldError;
}(APIError));
exports.FieldError = FieldError;
var CredentialError = (function (_super) {
    __extends(CredentialError, _super);
    function CredentialError() {
        return _super.call(this, "Invalid Credentials", "Double Check your Login Credentials", 401) || this;
    }
    return CredentialError;
}(APIError));
exports.CredentialError = CredentialError;
var JWTError = (function (_super) {
    __extends(JWTError, _super);
    function JWTError() {
        return _super.call(this, "Invalid JWT", "This JWT is not valid", 401) || this;
    }
    return JWTError;
}(APIError));
exports.JWTError = JWTError;
var NoPasswordSet = (function (_super) {
    __extends(NoPasswordSet, _super);
    function NoPasswordSet() {
        return _super.call(this, "No Password Set", "Please Verify your account", 401) || this;
    }
    return NoPasswordSet;
}(APIError));
exports.NoPasswordSet = NoPasswordSet;
var MissingRequiredField = (function (_super) {
    __extends(MissingRequiredField, _super);
    function MissingRequiredField(missingFields) {
        var e_2, _a;
        var _this = this;
        var map = [];
        try {
            for (var missingFields_1 = __values(missingFields), missingFields_1_1 = missingFields_1.next(); !missingFields_1_1.done; missingFields_1_1 = missingFields_1.next()) {
                var field = missingFields_1_1.value;
                map.push(field + " field is required");
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (missingFields_1_1 && !missingFields_1_1.done && (_a = missingFields_1.return)) _a.call(missingFields_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        _this = _super.call(this, "Field Error", map.join(", "), 400) || this;
        return _this;
    }
    return MissingRequiredField;
}(APIError));
exports.MissingRequiredField = MissingRequiredField;
var FieldsNotValidated = (function (_super) {
    __extends(FieldsNotValidated, _super);
    function FieldsNotValidated() {
        return _super.call(this, "Fields Not Validated", "This request failed a verification step. Please check the Docs", 400) || this;
    }
    return FieldsNotValidated;
}(APIError));
exports.FieldsNotValidated = FieldsNotValidated;
var NotFound = (function (_super) {
    __extends(NotFound, _super);
    function NotFound(type) {
        return _super.call(this, "Cannot Find " + type, "the resource cannot be found on the server", 404) || this;
    }
    return NotFound;
}(APIError));
exports.NotFound = NotFound;
var PasswordValidationError = (function (_super) {
    __extends(PasswordValidationError, _super);
    function PasswordValidationError() {
        return _super.call(this, "Bad Password", "Your password does not meet requirements", 401) || this;
    }
    return PasswordValidationError;
}(APIError));
exports.PasswordValidationError = PasswordValidationError;
var ResourcePermissionError = (function (_super) {
    __extends(ResourcePermissionError, _super);
    function ResourcePermissionError() {
        return _super.call(this, "Resource Permission Error", "You cannot attempt to modify this resource since it is not yours", 401) || this;
    }
    return ResourcePermissionError;
}(APIError));
exports.ResourcePermissionError = ResourcePermissionError;
var RouteError = (function (_super) {
    __extends(RouteError, _super);
    function RouteError() {
        return _super.call(this, "Route Error", "There are no routes for the route you are trying to reach", 404) || this;
    }
    return RouteError;
}(APIError));
exports.RouteError = RouteError;
var DatabaseError = (function (_super) {
    __extends(DatabaseError, _super);
    function DatabaseError() {
        return _super.call(this, "Error", "a database query failed", 500) || this;
    }
    return DatabaseError;
}(APIError));
exports.DatabaseError = DatabaseError;
var UnknownError = (function (_super) {
    __extends(UnknownError, _super);
    function UnknownError() {
        return _super.call(this, "Error", "something happened", 500) || this;
    }
    return UnknownError;
}(APIError));
exports.UnknownError = UnknownError;
var BadPasswordResetRequest = (function (_super) {
    __extends(BadPasswordResetRequest, _super);
    function BadPasswordResetRequest() {
        return _super.call(this, new Map([
            ["token", " or oldpassword must be provided"],
            ["oldpassword", " or token must be provided"]
        ])) || this;
    }
    return BadPasswordResetRequest;
}(FieldError));
exports.BadPasswordResetRequest = BadPasswordResetRequest;
