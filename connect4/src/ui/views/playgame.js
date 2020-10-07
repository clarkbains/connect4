import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';
import { isConstructorDeclaration } from 'typescript';

@inject(Gateway, Router)
export class PlayGame {
    constructor(g, r) {
        this.gateway = g
        this.router = r
        this.gameInfo = {}
        this.rows=10;
        this.cols=10;
        this.width=100;
        this.height=100;
        this.def = []
    }
    activate(obj) {
        this.gameid = obj.id
        if (!this.gameid) {
            console.log("No Game id detected, redirrecting to new game")
            this.router.navigate("newgame")
        }
        let _this = this
        window.addEventListener('resize', function (event) {
            if (_this.timeout) {
                return
            }
            _this.timeout = setTimeout(() => {
                _this.resize()
                _this.timeout = undefined
            }, 100)
        });

    }
    update(data) {
        console.log("Updating Data", data)
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillStyle = 'black';
        this.context.lineWidth = 15;
        this.context.beginPath();

        this.rows = data.length || 10
        this.cols = data.length?data[0].length:10

        this.context.rect(0, 0, this.width, this.height);
        this.context.fill();
        let items = ['red', 'yellow', 'green',"white"]
        for (let rowNum = 0; rowNum < this.rows; rowNum++) {
            for (let colNum = 0; colNum < this.cols; colNum++) {
                let co = data[rowNum][colNum]
                this.context.fillStyle = co;
                this.context.strokeStyle = 'black';

                this.context.beginPath();
                this.context.ellipse(
                    this.getCircleWidth() * colNum + this.getCircleWidth(),
                    this.getCircleHeight() * rowNum + this.getCircleHeight(),
                    0.85*this.getCircleWidth() / 2,
                    0.85*this.getCircleHeight() / 2,
                    0,
                    0,
                    Math.PI * 2);
                this.context.stroke();
                this.context.fill();

            }
        }

    }
    getCircleHeight(){
        return this.height / (this.rows + 1)
    }
    getCircleWidth(){
        return this.width/ (this.cols + 1);
    }

    reset() {
        function rand (l,h){
            return Math.floor(Math.random() * (h - l) + l)
        }
        console.log(rand(1,5))
        this.def=[]
        let col = ["red","blue","white","yellow"]
        for (let i =0; i< rand(10,20); i++){
            let row = []
            for (let j =0; j< rand(10,20);j++){
                row.push("white")
            }
            this.def.push(row)
        }
        this.resize()
    }
    resize() {
        this.height = this.m.clientWidth;
        this.width = this.m.clientWidth;
        this.boundingRect = this.game.getBoundingClientRect()
        console.log("Resizing, ",this.height, this.width)
        this.game.height = this.height;
        this.game.width = this.width;
        this.update(this.def)
    }
    getMousePos(rect, evt,w,h) {
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * w,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * h
        };
    }
    
    clickHandler(e){
        console.log(e,this)
        var rect = this.boundingRect;
        console.log(e.clientX - rect.left,e.clientY - rect.top,this. getMousePos(rect,e,this.width, this.height))
        const coord = {
            x: (e.clientX - rect.left-this.getCircleWidth())/this.getCircleWidth()+0.5,
            y: (e.clientY - rect.top-this.getCircleHeight())/this.getCircleHeight()+0.5,

          }
        const floored = {
            x: Math.floor(coord.x),
            y: Math.floor(coord.y)
        }
          //this.def[floored.y][floored.x]="green"
          let _this = this
          this.gateway.makeMove(this.gameid, floored).then((e)=>{
              _this.def[e.y][e.x] = "green"
              _this.update(_this.def)
              console.log(_this.def)

          })
        console.log(floored)
    
    }


    attached(obj) {
        this.m = this.widthDiv
        console.log(this.m)
        this.context = this.game.getContext('2d');
        this.reset()
        this.game.addEventListener('click', (e)=>this.clickHandler(e));
        }

}