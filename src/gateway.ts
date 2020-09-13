import { json } from 'body-parser'
import './models/models'
import sqlite3, { Database } from 'sqlite3'
import './models/models'
import * as models from './models/models'
interface sqlOpts {
  sql: string;
  params?: (string | number)[],
  model?: object
  cb?: (error: Error, res: object | object[]) => void
  single?: boolean
}





module.exports = class Gateway {
  db: sqlite3.Database

  constructor(dbFile: string, wipe: boolean) {
    this.db = new sqlite3.Database(dbFile, this.dbConnect)

    if (wipe) {
      this.dropTables().then(() => this.createTable()).then(() => {
        //Tesking update generation
        let mock = new models.DatabaseMatchAcceptance({matchid:1, userid:2, acceptance:5, msg:"test"})
        this.generateUpdate('MatchAcceptances', mock).then((r)=>{console.log(r)})
    })
  }
    else
      this.createTable()
  }

  getUserFromId(id: number) {
    return this._promisifySql({
      sql: "SELECT userid, name, email,score from Users where id=?",
      params: [id],
      model: models.DatabaseUser
    })
  }
  getSalt(email: string, userid: number) {
    return this._promisifySql({
      sql: "SELECT salt from Credentials JOIN Users on Users.userid = Credentials.userid where Users.email=? OR Users.userid=? LIMIT 1",
      params: [email, userid],
      model: models.DatabaseCredential
    })
  }
  getUserFromCredentials(email: string, hash: string) {
    return this._promisifySql({
      sql: "SELECT Users.* from Users JOIN Credentials on Users.userid = Credentials.userid where email=? and Credentials.hash=?",
      params: [email, hash],
      model: models.DatabaseUser
    })
  }

  putUser(x: models.DatabaseUser) {
    return this._promisifySql(this.generateInsert("Users", x))
  }
  putGame(x: models.DatabaseGame) {
    return this._promisifySql(this.generateInsert("Games", x))
  }
  putMove(x: models.DatabaseMove) {
    return this._promisifySql(this.generateInsert("Moves", x))
  }
  putMatch(x: models.DatabaseMatch) {
    return this._promisifySql(this.generateInsert("Matchs", x))
  }
  putMatchAcceptance(x: models.DatabaseMatchAcceptance) {
    return this._promisifySql(this.generateInsert("MatchAcceptances", x))
  }
  putCredential(x: models.DatabaseCredential) {
    return this._promisifySql(this.generateInsert("Credentials", x))
  }
  getUser(x: models.DatabaseUser) {
    return this._promisifySql(this.generateSelect("Users", x, models.DatabaseUser))
  }
  getGame(x: models.DatabaseGame) {
    return this._promisifySql(this.generateSelect("Games", x, models.DatabaseGame))
  }
  getMove(x: models.DatabaseMove) {
    return this._promisifySql(this.generateSelect("Moves", x, models.DatabaseMove))
  }
  getMatch(x: models.DatabaseMatch) {
    return this._promisifySql(this.generateSelect("Matchs", x, models.DatabaseMatch))
  }
  getMatchAcceptance(x: models.DatabaseMatchAcceptance) {
    return this._promisifySql(this.generateSelect("MatchAcceptances", x, models.DatabaseMatchAcceptance))
  }
  getCredential(x: models.DatabaseCredential) {
    return this._promisifySql(this.generateSelect("MatchAcceptances", x, models.DatabaseCredential))
  }

  fuzzySearch(email: string, id: number) {
    return this._promisifySql({
      sql: "SELECT * from Users where email=? or userid=?",
      params: [`%${email}%`, id]
    })
  }





  //DB Helper Methods
  dbConnect(err: Error | null) {
    if (err)
      console.error("Failed Connecting to db", err)
    else {
      console.log("Connected to db")
    }
  }

  _cb(r: Function, res: any[]) {
    return r(res)
  }
  _cbd(r: Function, res: any[]) {
    console.debug("SQL Result:", res)
    return r(res)
  }
  _promisifySql<T>(opts: sqlOpts): Promise<T[]> {
    let sql = opts.sql
    let params = opts.params
    let cb = opts.cb || this._cb
    let model = opts.model
    let single = opts.single || false
    let _this = this
    console.log("Running SQL: ", sql)

    return new Promise((resolve, reject) => {
      _this.db.all(sql, params, (error, res) => {
        if (error) {
          console.error(error)
          reject(error)
        }
        if (res && model) {
          if (single) {
            if (res.length == 0) {
              reject("No Results found")
              return
            }
            if (res.length > 1) console.warn(`Tried to get single result from ${sql}, got ${res.length}, check query`)
            res = [res[0]]
          }
          let assigned = models.assign(res, model,false)
          if (!assigned) {
            console.error(`Did not assign data correctly to model ${model}`, res)
          }
          res = assigned
        }
        resolve(res)
        //cb(resolve, res)
      })
    })
  }

  async createTable() {
    //Mostly automatically generated from TS models with /tools/generateTableSql.js
    //lengths have to be set manually, they are set very long on generation
    //Tool can also generate constructors from declared ts properties
    let tables = [
      "CREATE TABLE IF NOT EXISTS Users (`userid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`name` TEXT(1000),`email` TEXT(1000),`score` INTEGER(20)  NOT NULL);",
      "CREATE TABLE IF NOT EXISTS Credentials (`credentialid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`userid` TEXT(1000),`salt` TEXT(1000),`hash` TEXT(1000),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));",
      "CREATE TABLE IF NOT EXISTS Matchs (`matchid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`userid` INTEGER(20)  NOT NULL,`width` INTEGER(20)  NOT NULL,`height` INTEGER(20)  NOT NULL,`participants` INTEGER(20)  NOT NULL,`msg` TEXT(1000),`name` TEXT(1000),`acceptance` INTEGER(20)  NOT NULL,CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`),CONSTRAINT `width_fk` FOREIGN KEY (`width`) REFERENCES ws(`width`));",
      "CREATE TABLE IF NOT EXISTS Games (`gameid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`matchid` INTEGER(20)  NOT NULL,`currentTurn` INTEGER(20)  NOT NULL,`gameFinished` INTEGER(1),`score` INTEGER(20),CONSTRAINT `matchid_fk` FOREIGN KEY (`matchid`) REFERENCES matchs(`matchid`));",
      "CREATE TABLE IF NOT EXISTS Moves (`moveid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`gameid` INTEGER(20)  NOT NULL,`x` INTEGER(20)  NOT NULL,`y` INTEGER(20)  NOT NULL,`time` INTEGER(20)  NOT NULL,CONSTRAINT `gameid_fk` FOREIGN KEY (`gameid`) REFERENCES games(`gameid`));",
      "CREATE TABLE IF NOT EXISTS MatchAcceptances (`matchid` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,`userid` INTEGER(20)  NOT NULL,`acceptance` INTEGER(20)  NOT NULL,`msg` TEXT(1000),CONSTRAINT `userid_fk` FOREIGN KEY (`userid`) REFERENCES users(`userid`));"

    ]
    for (let tablesql of tables) {
      await this._promisifySql({ sql: tablesql })
    }
  }
  async dropTables() {
    //These have foreign keys, so ALWAYS drop in reverse of creation
    //Also I am aware Matchs is not the correct spelling, but the generator
    //simply appends a 's' to the model name
    let tables = [
      "DROP TABLE IF EXISTS MatchAcceptances",
      "DROP TABLE IF EXISTS Moves",
      "DROP TABLE IF EXISTS Games",
      "DROP TABLE IF EXISTS Matchs",
      "DROP TABLE IF EXISTS Credentials",
      "DROP TABLE IF EXISTS Users"
    ]
    for (let tablesql of tables) {
      await await this._promisifySql({ sql: tablesql })
    }
  }
  //Table name is not escaped, use only sanatised input
  generateInsert(tableName: string, item: object): sqlOpts {
    let queryParts: string[] = []
    let fields: string[] = []
    let binds: (string | number)[] = []
    for (let key of Object.keys(item)) {
      if (item[key] != undefined) {
        fields.push(`\`${key}\``)
        binds.push(item[key])
        queryParts.push(`?`)
      }
    }
    if (fields.length > 0) {
      return {
        sql: `INSERT INTO ${tableName} (${fields.join(",")}) VALUES (${queryParts.join(",")})`,
        params: binds
      }

    }
    return {
      sql: ";"
    }
  }
  //Table name is not escaped, use only sanatised input
  generateDelete(tableName: string, item: object): sqlOpts {
    let queryParts: string[] = []
    let fields: string[] = []
    let binds: (string | number)[] = []
    for (let key of Object.keys(item)) {
      if (item[key] != undefined) {
        binds.push(item[key])
        queryParts.push(`\`${key}\`=?`)
      }
    }
    if (fields.length > 0) {
      return {
        sql: `DELETE FROM ${tableName} WHERE ${queryParts.join(" AND ")}`,
        params: binds
      }

    }
    return {
      sql: ";"
    }
  }
  generateUpdate(tableName: string, item: object):Promise<sqlOpts> {

    return this._promisifySql<models.PragmaTableInfo>(
      {
        sql: `PRAGMA table_info('${tableName}')`,
        model: models.PragmaTableInfo
      }).then((r) => {
        let primaryKeys = new Set<string>();
        for (let column of r) {
          if (column.pk)
            primaryKeys.add(column.name)
        }
        let updateParts: string[] = []
        let whereParts: string[] = []
        let whereVals: (number | string)[] = []
        let updateVals: (string | number)[] = []
        for (let key of Object.keys(item)) {
          if (item[key] == undefined)
            continue
          else if (primaryKeys.has(key)) {
            whereParts.push(`\`${key}\`=?`)
            whereVals.push(item[key])
          } else {
            updateVals.push(item[key])
            updateParts.push(`\`${key}\`=?`)
          }
        }
        if (whereParts.length < 1)
          return {
            sql: ";"
          }
        return {
          sql: `UPDATE ${tableName} SET ${updateParts.join(",")} WHERE ${whereParts.join(" AND ")}`,
          params: [...updateVals, ...whereVals]
        }

      }).catch(()=>{
        return {sql:";"}
      })
  }

  //Table name is not escaped, use only sanatised input
  generateSelect(tableName: string, item: object, model: any): sqlOpts {
    let queryParts: string[] = []
    let fields: string[] = []
    let binds: (string | number)[] = []
    for (let key of Object.keys(item)) {
      if (item[key] != undefined) {
        binds.push(item[key])
        queryParts.push(`\`${key}\`=?`)
      }
    }
    if (fields.length > 0) {
      return {
        sql: `SELECT * FROM ${tableName} WHERE ${queryParts.join(" AND ")}`,
        params: binds,
        model: model
      }

    }
    return {
      sql: ";"
    }
  }



  debugRun(error, res) {
    if (error)
      console.error(error)
    console.log(res)
  }
  getUserById(id: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(JSON.stringify({ yay: "user" }))
      }, 1000)
    })


  }
}