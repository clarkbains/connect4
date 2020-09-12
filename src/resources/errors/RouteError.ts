import APIStatus from "../APIStatus";
import APIError from "./APIError";

export default class RouteError extends APIError {

    constructor(){
        super("Route Error","There are no routes for the route you are trying to reach",404)
    }
}