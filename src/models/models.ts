/*const { isNumber, xor } = require("lodash")


class User { 
    id: number
    name: string
    email: string
    verified: boolean
    salt: string
    hash: string
    constructor(u: User | object) { 
        this.id = u.id
        this.name = u.name
        this.email = u.email
        this.salt = u.salt
        this.hash = u.hash
    }
}
class DatabaseUser extends User{ 
    verified: boolean
    salt: string
    hash: string
    constructor(u: DatabaseUser | object) { 
        super(u)
        this.verified = u.verified
        this.salt = u.salt
        this.hash = u.hash
    }

}
class Secret {
    id: number
    name: string
    value: number[]
    constructor(secret:Secret){
        this.id = secret.id
        this.name = secret.name
        this.value = secret.value
    }
}

module.exports.models = {
    Route: Route,
    RouteWithOwner: RouteWithOwner,
    Secret: Secret

}
module.exports.assign = function (data, model, verify) {
    function assignAndVerify(row) {
        let res = new model(row)
        if (res.verify) {
            if (!res.verify(verify)) {
                throw new Error("Didn't pass verification")
            }
        }
        return res
    }
    if (Array.isArray(data)) {
        return data.map(row => assignAndVerify(row))
    }
    return assignAndVerify(data)
}

//Shallow compare of property diffs
module.exports.compare = function (oldData, newData) {
    let diffs = []
    let propertyList = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];
    for (let key of propertyList) {
        if (key.startsWith("_")) continue
        let o = oldData[key]
        o = oldData[`_db_${key}`]?oldData[`_db_${key}`](o):o
        let n = newData[key]
        n = newData[`_db_${key}`]?newData[`_db_${key}`](n):n
        if (n !== o) {
            diffs.push( {
                key: key,
                from: o,
                to: n
            })
        }
    }
    return diffs


}*/