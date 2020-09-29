import { assign, PragmaTableInfo } from '../models/models'
import sqlite3, { Database } from 'sqlite3'


export interface PromisifiedSqlOpts {
    sql: string;
    params?: (string | number)[],
    model?: object
    cb?: (error: Error, res: object | object[]) => void
    single?: boolean
}
export interface SqlGeneratorOpts {
    obj: object
    whereClause?: string
    whereBinds?: any[]
    limit?: number
    db: sqlite3.Database
}
export interface SqlOpts {
    whereClause?: string
    whereBinds?: any[]
    limit?: number
    db: sqlite3.Database
}
export abstract class DatabaseModel {
    cls: any
    tableName: string
    // db: sqlite3.Database
    constructor(tableName: string) {
        let _this = this
        Object.defineProperty(this, 'cls', {
            enumerable: false,
            value: _this.constructor
        })
        Object.defineProperty(this, 'tableName', {
            enumerable: false,
            value: tableName
        })


        //this.db = database
    }
    insert(opts: SqlOpts) {

        let o = <SqlGeneratorOpts>opts
        o.obj = this
        return this.runInsert(o)
    }
    select<T>(opts: SqlOpts): Promise<T[]> {
        let o = <SqlGeneratorOpts>opts
        o.obj = this
        return this.runSelect<T>(o)
    }
    delete(opts: SqlOpts) {
        let o = <SqlGeneratorOpts>opts
        o.obj = this
        return this.runDelete(o)
    }
    update(opts: SqlOpts) {
        let o = <SqlGeneratorOpts>opts
        o.obj = this
        return this.runUpdate(o)
    }
    raw(db: sqlite3.Database, opts: PromisifiedSqlOpts) {
        return DatabaseModel.promisifySql(db, opts)
    }
    runInsert(opts: SqlGeneratorOpts) {
        return DatabaseModel.promisifySql(opts.db, this.generateInsert(opts))
    }
    runSelect<T>(opts: SqlGeneratorOpts): Promise<T[]> {
        return DatabaseModel.promisifySql(opts.db, this.generateSelect(opts))

    }
    runDelete(opts: SqlGeneratorOpts) {
        return DatabaseModel.promisifySql(opts.db, this.generateDelete(opts))

    }
    runUpdate(opts: SqlGeneratorOpts) {
        return this.generateUpdate(opts).then(g => DatabaseModel.promisifySql(opts.db, g))
    }
    //Table name is not escaped, use only sanatised input
    generateInsert(opts: SqlGeneratorOpts): PromisifiedSqlOpts {
        if (opts.limit || opts.whereClause || opts.whereBinds) {
            console.warn("Limit, WhereClause and WhereBinds have no effect on Insert Generation")
        }

        let queryParts: string[] = []
        let fields: string[] = []
        let binds: (string | number)[] = []
        for (let key of Object.keys(opts.obj)) {
            if (opts.obj[key] != undefined) {
                fields.push(`\`${key}\``)
                binds.push(opts.obj[key])
                queryParts.push(`?`)
            }
        }
        if (fields.length > 0)
            return {
                sql: `INSERT INTO ${this.tableName} (${fields.join(",")}) VALUES (${queryParts.join(",")})`,
                params: binds
            }

        return {
            sql: "select null;"
        }
    }
    generateUpdate(opts: SqlGeneratorOpts): Promise<PromisifiedSqlOpts> {

        return DatabaseModel.promisifySql<PragmaTableInfo>(opts.db,
            {
                sql: `PRAGMA table_info('${this.tableName}')`,
                model: PragmaTableInfo
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
                for (let key of Object.keys(opts.obj)) {
                    if (opts.obj[key] == undefined)
                        continue
                    else if (primaryKeys.has(key)) {
                        whereParts.push(`\`${key}\`=?`)
                        whereVals.push(opts.obj[key])
                    } else {
                        updateVals.push(opts.obj[key])
                        updateParts.push(`\`${key}\`=?`)
                    }
                }
                if (opts.whereBinds && opts.whereClause) {
                    console.info("Using custom binds for update")
                    whereParts = [opts.whereClause]
                    whereVals = opts.whereBinds
                } else if (whereParts.length < 1) {
                    //Provide Protection against faulty primary key detection
                    //console.log(r, updateParts, updateVals, whereParts, whereVals)
                    return {
                        sql: "select null;"
                    }
                }

                return {
                    sql: `UPDATE ${this.tableName} SET ${updateParts.join(",")} WHERE ${whereParts.join(" AND ")} ${opts.limit === undefined ? "" : ` LIMIT ${opts.limit}`};`,
                    params: [...updateVals, ...whereVals]
                }

            }).catch(() => {
                return { sql: "select null;" }
            })
    }
    generateDelete(opts: SqlGeneratorOpts): PromisifiedSqlOpts {
        if (!opts.whereBinds && !opts.whereClause) {
            let queryParts: string[] = []
            let binds: (string | number)[] = []
            for (let key of Object.keys(opts.obj)) {
                if (opts.obj[key] != undefined) {
                    binds.push(opts.obj[key])
                    queryParts.push(`\`${key}\`=?`)
                }
            }
            if (queryParts.length > 0) {

                return {
                    sql: `DELETE FROM ${this.tableName} WHERE ${queryParts.join(" AND ")}${opts.limit === undefined ? "" : ` LIMIT ${opts.limit}`};`,
                    params: binds
                }

            }
        } else {
            console.info("Using Custom Where bind for delete")
            return {
                sql: `DELETE FROM ${this.tableName} WHERE ${opts.whereClause} ${opts.limit === undefined ? "" : ` LIMIT ${opts.limit}`};`,
                params: opts.whereBinds
            }
        }
        return {
            sql: "select null;"
        }
    }
    generateSelect(opts: SqlGeneratorOpts): PromisifiedSqlOpts {
        if (!opts.whereBinds && !opts.whereClause) {
            let queryParts: string[] = []
            let binds: (string | number)[] = []
            for (let key of Object.keys(opts.obj)) {
                if (opts.obj[key] != undefined) {
                    binds.push(opts.obj[key])
                    queryParts.push(`\`${key}\`=?`)
                }
            }
            if (queryParts.length > 0) {

                return {
                    sql: `SELECT * FROM ${this.tableName} WHERE ${queryParts.join(" AND ")}${opts.limit === undefined ? "" : ` LIMIT ${opts.limit}`};`,
                    params: binds,
                    model: this.cls
                }

            }

        } else {
            console.info("Using Custom Where bind for select")
            return {
                sql: `SELECT *  FROM ${this.tableName} WHERE ${opts.whereClause} ${opts.limit === undefined ? "" : ` LIMIT ${opts.limit}`};`,
                params: opts.whereBinds,
                model: this.cls
            }
        }
        return {
            sql: "select null;"
        }
    }

    static promisifySql<T>(db: sqlite3.Database, opts: PromisifiedSqlOpts): Promise<T[]> {
        let sql = opts.sql
        let params = opts.params
        //let cb = opts.cb || this._cb
        let model = opts.model
        console.log("Running SQL: ", sql)

        return new Promise((resolve, reject) => {
            db.all(sql, params, (error: Error, res: null | object | object[]) => {
                if (error) {
                    return reject(error)
                }
                if (res && model) {
                    let assigned = assign(res, model, false)
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

}