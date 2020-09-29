export class Piece {
    constructor(){
        this.val="router"
        let x = 0
        setInterval(()=>{x++; this.val = x},100)
    }
}