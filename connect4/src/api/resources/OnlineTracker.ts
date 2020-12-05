export default class OnlineTracker{
    timeout:number
    people:Map<number, Date>
    constructor(timeout:number){
        this.timeout = timeout
        this.people = new Map();
    }
    update(userid:number){
        this.people.set(userid, new Date())
    }
    delete(userid:number){
        this.people.delete(userid)
    }
    getAll(){
        let out = []
        for(let userid of this.people.keys()){
            if (this.get(userid)){
                out.push(userid)
            }
        }
        return out
    }
    get(userid:number):number{
        if (this.people.has(userid)){
            //@ts-ignore
            let s:number = (new Date() - this.people.get(userid))/1000

            if (s>this.timeout && this.timeout!== -1){
                this.people.delete(userid)
                return undefined;
            }
            else {
                return s
            }
        }
        return undefined;
    }

}