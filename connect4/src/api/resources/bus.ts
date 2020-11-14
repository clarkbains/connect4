import express from 'express'
import { Socket } from 'socket.io';
import { DatabaseUser } from '../models/models';

class event {
    event: any
    id: number
    constructor(event: any, id: number) {
        this.event = event;
        this.id = id
    }
}
class eventHandler {
    socket: Socket
    eventName: string
    filter: Function
    user:DatabaseUser
    constructor(name: string, socket: Socket, filter: Function, user:DatabaseUser) {
        this.socket = socket
        this.filter = filter
        this.eventName = name
        this.user = user
    }

}
export default class Bus {
    // subscriptions: Map<String, Map<number,Map<Number, Number>>>
    handlers: Map<String, eventHandler[]>
    sockets: Map<string, Socket>


    constructor() {
        this.handlers = new Map();
        this.sockets = new Map();
    }
    //Adds a websocket to the bus. Still needs to be connected to the bus.
    addNewWS(socket: Socket) {
        this.sockets.set(socket.id, socket)
        console.log("Unauthed Socket atached", socket.id)
        socket.on("disconnect", () => {
            this.sockets.delete(socket.id)
        })

        //Get rid of opened sockets after a bit if they never get promoted into the bus
        socket.timeout = setTimeout(() => {
            console.log(`Removing socket ${socket.id} because it was never authorized`)
            socket.disconnect(true)
            this.sockets.delete(socket.id)
        }, 60000)
    }
    //Conne
    promoteWS(user:DatabaseUser,id: string, event: string, clientName: string, filter: Function, listenerMaps: Map<String,Function>) {
        console.log(id)
        let socket = this.sockets.get(id)
        if (listenerMaps){
            for (let event of Object.keys(listenerMaps))
                socket.on(event, (data)=>{
                    listenerMaps[event](data, user)
                })
        }

        if (!socket) {
            throw new Error("Cannot Find Socket")
        }
        socket.user = user
        clearTimeout(socket.timeout)

        if (!this.handlers.has(event)) {
            this.handlers.set(event, [])
        }
        console.log(`Socket ${socket.id} accessing channel "${event}" using client name of "${clientName}"`)
        this.handlers.get(event).push(new eventHandler(clientName, socket, filter,user))
    }

    emit(event: string, data: any) {
        if (!this.handlers.has(event)) {
            return false
        }
        this.handlers.set(event, this.handlers.get(event).filter((evnt) => {
            if (!evnt.filter || (evnt.filter && evnt.filter(data))) {
                if (!evnt.socket.disconnected) {

                    evnt.socket.emit(evnt.eventName, data)
                    return true;
                }
                console.log("Disconnecting from bus", evnt.socket.id)
                return false;

            }
        }))
    }

}