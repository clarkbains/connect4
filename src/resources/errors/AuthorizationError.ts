import APIError from "./APIError";

export default class AuthorizationError extends APIError {
    constructor(){
        super("Invalid Session", "You may need to sign in again",401)
    }
}