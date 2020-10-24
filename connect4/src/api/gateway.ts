import { json } from 'body-parser'
import './models/models'
import sqlite3, { Database } from 'sqlite3'
import * as models from './models/models'
import { DatabaseModel } from './resources/databaseHelpers'


export default class Gateway {
  db: sqlite3.Database

  constructor(dbFile: string, wipe: boolean) {
    this.db = new sqlite3.Database(dbFile, this.dbConnect)

    if (wipe) {
      this.dropTables().then(() => this.createTable()).then(() => {
        //Tesking update generation
        let mock = new models.DatabaseUser({
          email:"clarkbains@gmail.com",
          username:"thelostelectron",
          name:"clark",
          score:71})
        mock.insert({db:this.db}).then(e=>mock.select({db:this.db})).then(r=>{console.log(r)})
        //mockgenerateUpdate('MatchAcceptances', mock).then((r) => { console.log(r) })
      })
    }
    else
      this.createTable()
  }


  //DB Helper Methods
  dbConnect(err: Error | null) {
    if (err)
      console.error("Failed Connecting to db", err)
    else {
      console.log("Connected to db")
    }
  }

  

  async createTable() {
    //Mostly automatically generated from TS models with /tools/generateTableSql.js
    //lengths have to be set manually, they are set very long on generation
    //Tool can also generate constructors from declared ts properties
    let tables = [
      "CREATE TABLE IF NOT EXISTS Users (`userid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`name` TEXT(1000) NOT NULL,`username` TEXT(1000) NOT NULL,`email` TEXT(1000) NOT NULL,`score` INTEGER(20)  NOT NULL DEFAULT 0,`private` INTEGER(1) DEFAULT 0,CONSTRAINT `username_uq` UNIQUE (`username`),CONSTRAINT `email_uq` UNIQUE (`email`));",
      "CREATE TABLE IF NOT EXISTS Credentials (`credentialid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`userid` TEXT(1000),`salt` TEXT(1000),`hash` TEXT(1000),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
      "CREATE TABLE IF NOT EXISTS Matchs (`matchid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`userid` INTEGER(20)  NOT NULL,`width` INTEGER(20)  NOT NULL,`height` INTEGER(20)  NOT NULL,`participants` INTEGER(20)  NOT NULL,`msg` TEXT(1000),`name` TEXT(1000) NOT NULL DEFAULT (strftime('Game %Y-%m-%d %H-%M','now')),`privacylevel` INTEGER(20)  NOT NULL DEFAULT (0),`status` INTEGER(20)  NOT NULL,CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
      "CREATE TABLE IF NOT EXISTS Games (`gameid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`matchid` INTEGER(20)  NOT NULL,`currentturn` INTEGER(20)  NOT NULL,`gamefinished` INTEGER(1),`userid` INTEGER(20) ,CONSTRAINT `matchid_fk` FOREIGN KEY (`matchid`) REFERENCES matchs(`matchid`),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
      "CREATE TABLE IF NOT EXISTS Moves (`moveid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`gameid` INTEGER(20)  NOT NULL,`userid` INTEGER(20)  NOT NULL,`x` INTEGER(20)  NOT NULL,`y` INTEGER(20)  NOT NULL,`time` INTEGER(20)  NOT NULL,CONSTRAINT `gameid_fk` FOREIGN KEY (`gameid`) REFERENCES games(`gameid`),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
      "CREATE TABLE IF NOT EXISTS MatchAcceptances (`matcchacceptanceid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`matchid` INTEGER(20)  NOT NULL,`userid` INTEGER(20)  NOT NULL,`status` INTEGER(20)  NOT NULL DEFAULT (0),`msg` TEXT(1000),CONSTRAINT `matchid_fk` FOREIGN KEY (`matchid`) REFERENCES matchs(`matchid`),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
      "CREATE TABLE IF NOT EXISTS PendingFriends (`pendingfriendid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`user1` INTEGER(20)  NOT NULL,`user2` INTEGER(20)  NOT NULL,`msg` TEXT(1000),CONSTRAINT `user1Usersuserid_fkc` FOREIGN KEY (`user1`) REFERENCES Users (`userid`),CONSTRAINT `user2Usersuserid_fkc` FOREIGN KEY (`user2`) REFERENCES Users (`userid`));",
      "CREATE TABLE IF NOT EXISTS Friends (`friendid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`user1` INTEGER(20)  NOT NULL,`user2` INTEGER(20)  NOT NULL,CONSTRAINT `user1Usersuserid_fkc` FOREIGN KEY (`user1`) REFERENCES Users (`userid`),CONSTRAINT `user2Usersuserid_fkc` FOREIGN KEY (`user2`) REFERENCES Users (`userid`));",
      "CREATE TABLE IF NOT EXISTS GameMessages (`gamemessageid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`gameid` INTEGER(20)  NOT NULL,`userid` INTEGER(20)  NOT NULL,`msg` TEXT(1000) NOT NULL,`time` INTEGER(20)  NOT NULL DEFAULT (strftime('%s','now')),CONSTRAINT `gameid_fk` FOREIGN KEY (`gameid`) REFERENCES games(`gameid`),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));"
    ]
    for (let tablesql of tables) {
      await DatabaseModel.promisifySql(this.db,{ sql: tablesql })
    }
  }
  async dropTables() {
    //These have foreign keys, so ALWAYS drop in reverse of creation
    //Also I am aware Matchs is not the correct spelling, but the generator
    //simply appends a 's' to the model name
    let tables = [
      "DROP TABLE IF EXISTS GameMessages",
      "DROP TABLE IF EXISTS Friends",
      "DROP TABLE IF EXISTS PendingFriends",
      "DROP TABLE IF EXISTS MatchAcceptances",
      "DROP TABLE IF EXISTS Moves",
      "DROP TABLE IF EXISTS Games",
      "DROP TABLE IF EXISTS Matchs",
      "DROP TABLE IF EXISTS Credentials",
      "DROP TABLE IF EXISTS Users"
    ]
    for (let tablesql of tables) {
      await DatabaseModel.promisifySql(this.db,{ sql: tablesql })
    }
  }

  getUserById(id: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(JSON.stringify({ yay: "user" }))
      }, 1000)
    })
  }
}