import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';

@inject(Gateway, Router)
export class PlayGame {
    constructor(g, r) {
        this.gateway = g
        this.router = r
        this.gameInfo = {}
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
        this.context.clearRect(0, 0, this.game.width, this.game.height);
        this.context.fillStyle = 'black';
        this.context.lineWidth = 15;
        this.context.beginPath();


        let rows = data.length || 10
        let cols = data.length?data[0].length:10

        let circleWidth = this.game.width / (cols + 1);
        let circleHight = this.game.height / (rows + 1)

        this.context.rect(0, 0, this.game.width, this.game.height);
        this.context.fill();
        let items = ['red', 'yellow', 'green',"white"]
        for (let rowNum = 0; rowNum < rows; rowNum++) {
            for (let colNum = 0; colNum < cols; colNum++) {
                let co = data[rowNum][colNum]
                this.context.fillStyle = co;
                this.context.strokeStyle = 'black';

                this.context.beginPath();
                this.context.ellipse(
                    circleWidth * colNum + circleWidth,
                    circleHight * rowNum + circleHight,
                    0.85*circleWidth / 2,
                    0.85* circleHight / 2,
                    0,
                    0,
                    Math.PI * 2);
                this.context.stroke();
                this.context.fill();

            }
        }

        console.log(this.context)
        this.rows
    }
    refresh() {
        this.update([["blue","white","white","blue","white"],
        ["blue","red","white","blue","blue"],
        ["red","red","blue","blue","red"],
        ["blue","blue","red","white","blue"],
        ["red","blue","white","blue","red"],
        ["red","red","red","white","blue"]])
    }
    resize() {
        this.game.height = window.innerHeight * 0.90;
        this.game.width = window.innerWidth * 0.90;
        this.refresh()
    }


    attached() {
        this.context = this.game.getContext('2d');
        this.game.height = window.innerHeight * 0.70;
        this.game.width = window.innerWidth * 0.70;
        this.resize()
        this.refresh()
    }


}