//MAIN
export class APIStatus {
    cls: string
    msg: string
    info: string
    code: number
    constructor(cls: string, msg: string, info: string, code: number) {
        this.cls = cls
        this.msg = msg
        this.info = info
        this.code = code
    }
    toString() {
        return JSON.stringify({
            cls: this.cls,
            msg: this.msg,
            info: this.info
        })
    }
}
//SUCCESSES
export class APISuccess extends APIStatus {

    constructor(msg: string, info: string, code?: number) {
        super("success", msg, info, code ? code : 200)
    }

}
export class CreateUserSuccess extends APISuccess {

    constructor() {
        super("account created", "please validate your email")
    }

}
export class ChangePasswordSuccess extends APISuccess {

    constructor() {
        super("Password Changed", "please login again")
    }

}
export class LoginSuccess extends APISuccess {
    token: string
    constructor(jwt:string) {
        super("Logged In", "Please Make a request")
        this.token = jwt
    }

}
export class DeleteSuccess extends APISuccess {
    constructor(type:string) {
        super("Deleted", `${type} has been deleted`)
    }

}
//ERRORS
export class APIError extends APIStatus {

    constructor(msg: string, info: string, code: number) {
        super("error", msg, info, code)
    }
}
export class AuthorizationError extends APIError {
    constructor() {
        super("Invalid Session", "You may need to sign in again", 401)
    }
}
export class FieldError extends APIError {
    constructor(invalidItems: Map<string, string>) {
        let messagePairs: string[] = []
        for (let key of invalidItems.keys()) {
            messagePairs.push(`"${key}" ${invalidItems.get(key)}.`)
        }
        super("Field Error", messagePairs.join(", "), 400)
    }
}
export class CredentialError extends APIError {
    constructor() {
        super("Invalid Credentials", "Double Check your Login Credentials", 401)
    }
}
export class JWTError extends APIError {
    constructor() {
        super("Invalid JWT", "This JWT is not valid", 401)
    }
}
export class NoPasswordSet extends APIError {
    constructor() {
        super("No Password Set", "Please Verify your account", 401)
    }
}
export class MissingRequiredField extends APIError{
    constructor (missingFields:string[]){
        let map = []
        for (let field of missingFields){
            map.push(`${field} field is required`)
        }
            super("Field Error", map.join(", "), 400)
        }

    }

export class NotFound extends APIError {
    constructor(type: string){
        super(`Cannot Find ${type}`, `the resource cannot be found on the server`, 404)
    }
}
export class PasswordValidationError extends APIError {
    constructor() {
        super("Bad Password", "Your password does not meet requirements", 401)
    }
}
export class ResourcePermissionError extends APIError {
    constructor() {
        super("Resource Permission Error", "You cannot attempt to modify this resource since it is not yours", 401)
    }
}
export class RouteError extends APIError {

    constructor() {
        super("Route Error", "There are no routes for the route you are trying to reach", 404)
    }
}
export class DatabaseError extends APIError {
    constructor() {
        super("Error", "a database query failed", 500)
    }
}
export class UnknownError extends APIError {
    constructor() {
        super("Error", "something happened", 500)
    }
}
export class BadPasswordResetRequest extends FieldError {
    constructor() {
        super(new Map(
            [
                ["token", " or oldpassword must be provided"],
                ["oldpassword", " or token must be provided"]
            ]
        )
        )
    }
}
