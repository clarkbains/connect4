import APIError from "./APIError";

export default class FieldError extends APIError {
    constructor(invalidItems:Map<string,string>){
        let messagePairs:string[] = []
        for (let key of invalidItems.keys()){
            messagePairs.push(`"${key}" is invalid because ${invalidItems.get(key)}.`)
        }
        super("Field Error", messagePairs.join(", "), 400)
    }
}