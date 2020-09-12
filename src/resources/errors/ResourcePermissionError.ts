import APIError from "./APIError";

export default class ResourcePermissionError extends APIError {
    constructor(){
        super("Resource Permission Error", "You cannot attempt to modify this resource since it is not yours",401)
    }
}