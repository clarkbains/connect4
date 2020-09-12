import APIError from "./APIError";

export default class UnknownError extends APIError {
    constructor(){
        super("Error", "something happened",500)
    }
}