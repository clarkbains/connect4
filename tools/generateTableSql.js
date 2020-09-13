/* Simple CLI Tool to parse the typescript model file, and generate some semi useable SQL from the type hints.
* Won't always be correct, and you should probably tailer the generated sql to your specific application
*/
const fs = require('fs')
let models = fs.readFileSync(process.argv[2],'utf8')
let classes = models.match(/export\s*class\s*(\w*)/ig).map(e=>e.match(/(\w*)$/)[1])


//classes = classes[1].split("\n").map(elm=>elm.replace(/\s/g,"").split(":")[0].replace(/(^"|"$)/g,"")).filter(e=>e)
keys = []
if (process.argv[3]){
    //console.log("Looking for class: ", process.argv[3], "\n")
    let regex = new RegExp(`class\\s*${process.argv[3].trim()}\\s{([^}]*)}`,"is")
    let properties = models.match(regex)
    if (!properties){
        console.error("Could Not find that class")
        console.log(classes)
        process.exit(1)
    }

    properties = properties[1].split("\n").map(e=>e.trim()).filter(e=>e)
    //console.log(properties)
    for (let prop of properties){
        //console.log("Inscpecting Property", prop)
        let m = prop.match(/^(\w*)\s*:\s*(.*)$/i)
        if (m){
            //console.log("Pushing ", m[1], m[2])
            keys.push(
                {
                    name: m[1],
                    type: m[2]
                }
            )
        }

    }

} else {
    console.error("Please provide a model to sqlize")
    console.log(classes)
    process.exit(1)
}
let sqlParams = []
let constraints = []
for (let i in keys){
    let ro = keys[i]
    //console.log(i, ro.name, ro.type)
    if (i==0 && ro.name.match(/id/i) && ro.type.match(/number/i)){
        //console.log("Creating id")
        sqlParams.push(`\`${ro.name}\` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL`)
        //constraints.push(`CONSTRAINT \`${ro.name}_pk\` PRIMARY KEY (\`${ro.name}\`)`)
    } else if (ro.type.match(/number/i) && (ro.type.match(/null/i)|| ro.type.match(/undefined/i))){
        sqlParams.push(`\`${ro.name}\` INTEGER(20)`)
    } else if (ro.type.match(/number/i)){
        sqlParams.push(`\`${ro.name}\` INTEGER(20)  NOT NULL`)
    } else if (ro.type.match(/boolean/i)){
        sqlParams.push(`\`${ro.name}\` INTEGER(1)`)
    } else if (ro.type.match(/string/i)){
        sqlParams.push(`\`${ro.name}\` TEXT(1000)`)
    }
    //If key is like gameid, add a foreign key to game.gameid
    let g = ro.name.match(/(\w*?)[_-]*id/i)
    if (i >0 && g && g[1]){
        constraints.push(`CONSTRAINT \`${ro.name}_fk\` FOREIGN KEY (\`${ro.name}\`) REFERENCES ${g[1]}s(\`${ro.name}\`)`)
    }
}
let className = process.argv[3]
let tableName = className.replace(/database/i,"")

let constructorAssignments = []
let constructorParamName = tableName.match(/^(.{1,1})/)[1].toLowerCase()
for (let i in keys){
    let ro = keys[i]
    constructorAssignments.push(`\tthis.${ro.name} = ${constructorParamName}.${ro.name}`)
}
console.log("\nAutogenerated constructor: \n")
console.log(`constructor(${constructorParamName}:${className}|object){\n${constructorAssignments.join("\n")}\n}`)
console.log(`\nAutogenerated SQL Create command: CREATE TABLE IF NOT EXISTS ${tableName}s (${sqlParams.concat(constraints).join(",")});`)