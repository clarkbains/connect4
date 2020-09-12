import APIError from "./APIError";

export default class CredentialError extends APIError {
    constructor(){
        super("Invalid Credentials", "Double Check your Login Credentials",401)
    }
}