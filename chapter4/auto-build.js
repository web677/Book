const { spawn } = require('child_process')

setInterval(() => {
    let gitPull = spawn("git", ["pull"])

    gitPull.stdout.on("data", data => {
        console.log(data)
    })

},1000)


