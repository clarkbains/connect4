"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModel = void 0;
var models_1 = require("../models/models");
var DatabaseModel = (function () {
    function DatabaseModel(tableName) {
        var _this = this;
        Object.defineProperty(this, 'cls', {
            enumerable: false,
            value: _this.constructor
        });
        Object.defineProperty(this, 'tableName', {
            enumerable: false,
            value: tableName
        });
    }
    DatabaseModel.prototype.insert = function (opts) {
        var o = opts;
        o.obj = this;
        return this.runInsert(o);
    };
    DatabaseModel.prototype.select = function (opts) {
        var o = opts;
        o.obj = this;
        return this.runSelect(o);
    };
    DatabaseModel.prototype.delete = function (opts) {
        var o = opts;
        o.obj = this;
        return this.runDelete(o);
    };
    DatabaseModel.prototype.update = function (opts) {
        var o = opts;
        o.obj = this;
        return this.runUpdate(o);
    };
    DatabaseModel.prototype.raw = function (db, opts) {
        return DatabaseModel.promisifySql(db, opts);
    };
    DatabaseModel.prototype.runInsert = function (opts) {
        return DatabaseModel.promisifySql(opts.db, this.generateInsert(opts));
    };
    DatabaseModel.prototype.runSelect = function (opts) {
        return DatabaseModel.promisifySql(opts.db, this.generateSelect(opts));
    };
    DatabaseModel.prototype.runDelete = function (opts) {
        return DatabaseModel.promisifySql(opts.db, this.generateDelete(opts));
    };
    DatabaseModel.prototype.runUpdate = function (opts) {
        return this.generateUpdate(opts).then(function (g) { return DatabaseModel.promisifySql(opts.db, g); });
    };
    DatabaseModel.prototype.generateInsert = function (opts) {
        var e_1, _a;
        if (opts.limit || opts.whereClause || opts.whereBinds) {
            console.warn("Limit, WhereClause and WhereBinds have no effect on Insert Generation");
        }
        var queryParts = [];
        var fields = [];
        var binds = [];
        try {
            for (var _b = __values(Object.keys(opts.obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (opts.obj[key] != undefined) {
                    fields.push("`" + key + "`");
                    binds.push(opts.obj[key]);
                    queryParts.push("?");
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (fields.length > 0)
            return {
                sql: "INSERT INTO " + this.tableName + " (" + fields.join(",") + ") VALUES (" + queryParts.join(",") + ")",
                params: binds
            };
        return {
            sql: "select null;"
        };
    };
    DatabaseModel.prototype.generateUpdate = function (opts) {
        var _this_1 = this;
        return DatabaseModel.promisifySql(opts.db, {
            sql: "PRAGMA table_info('" + this.tableName + "')",
            model: models_1.PragmaTableInfo
        }).then(function (r) {
            var e_2, _a, e_3, _b;
            var primaryKeys = new Set();
            try {
                for (var r_1 = __values(r), r_1_1 = r_1.next(); !r_1_1.done; r_1_1 = r_1.next()) {
                    var column = r_1_1.value;
                    if (column.pk)
                        primaryKeys.add(column.name);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (r_1_1 && !r_1_1.done && (_a = r_1.return)) _a.call(r_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var updateParts = [];
            var whereParts = [];
            var whereVals = [];
            var updateVals = [];
            try {
                for (var _c = __values(Object.keys(opts.obj)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var key = _d.value;
                    if (opts.obj[key] == undefined)
                        continue;
                    else if (primaryKeys.has(key)) {
                        whereParts.push("`" + key + "`=?");
                        whereVals.push(opts.obj[key]);
                    }
                    else {
                        updateVals.push(opts.obj[key]);
                        updateParts.push("`" + key + "`=?");
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
            }
            if (opts.whereBinds && opts.whereClause) {
                console.info("Using custom binds for update");
                whereParts = [opts.whereClause];
                whereVals = opts.whereBinds;
            }
            else if (whereParts.length < 1) {
                return {
                    sql: "select null;"
                };
            }
            return {
                sql: "UPDATE " + _this_1.tableName + " SET " + updateParts.join(",") + " WHERE " + whereParts.join(" AND ") + " " + (opts.limit === undefined ? "" : " LIMIT " + opts.limit) + ";",
                params: __spread(updateVals, whereVals)
            };
        }).catch(function () {
            return { sql: "select null;" };
        });
    };
    DatabaseModel.prototype.generateDelete = function (opts) {
        var e_4, _a;
        if (!opts.whereBinds && !opts.whereClause) {
            var queryParts = [];
            var binds = [];
            try {
                for (var _b = __values(Object.keys(opts.obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    if (opts.obj[key] != undefined) {
                        binds.push(opts.obj[key]);
                        queryParts.push("`" + key + "`=?");
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            if (queryParts.length > 0) {
                return {
                    sql: "DELETE FROM " + this.tableName + " WHERE " + queryParts.join(" AND ") + (opts.limit === undefined ? "" : " LIMIT " + opts.limit) + ";",
                    params: binds
                };
            }
        }
        else {
            console.info("Using Custom Where bind for delete");
            return {
                sql: "DELETE FROM " + this.tableName + " WHERE " + opts.whereClause + " " + (opts.limit === undefined ? "" : " LIMIT " + opts.limit) + ";",
                params: opts.whereBinds
            };
        }
        return {
            sql: "select null;"
        };
    };
    DatabaseModel.prototype.generateSelect = function (opts) {
        var e_5, _a;
        if (!opts.whereBinds && !opts.whereClause) {
            var queryParts = [];
            var binds = [];
            try {
                for (var _b = __values(Object.keys(opts.obj)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    if (opts.obj[key] != undefined) {
                        binds.push(opts.obj[key]);
                        queryParts.push("`" + key + "`=?");
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            if (queryParts.length > 0) {
                return {
                    sql: "SELECT * FROM " + this.tableName + " WHERE " + queryParts.join(" AND ") + (opts.limit === undefined ? "" : " LIMIT " + opts.limit) + ";",
                    params: binds,
                    model: this.cls
                };
            }
        }
        else {
            console.info("Using Custom Where bind for select");
            return {
                sql: "SELECT *  FROM " + this.tableName + " WHERE " + opts.whereClause + " " + (opts.limit === undefined ? "" : " LIMIT " + opts.limit) + ";",
                params: opts.whereBinds,
                model: this.cls
            };
        }
        return {
            sql: "select null;"
        };
    };
    DatabaseModel.promisifySql = function (db, opts) {
        var sql = opts.sql;
        var params = opts.params;
        var model = opts.model;
        console.log("Running SQL: ", sql);
        return new Promise(function (resolve, reject) {
            db.all(sql, params, function (error, res) {
                if (error) {
                    return reject(error);
                }
                if (res && model) {
                    var assigned = models_1.assign(res, model, false);
                    if (!assigned) {
                        console.error("Did not assign data correctly to model " + model, res);
                    }
                    res = assigned;
                }
                resolve(res);
            });
        });
    };
    return DatabaseModel;
}());
exports.DatabaseModel = DatabaseModel;
