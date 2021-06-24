const zeroEks = require('0x')
const path = require('path')

async function capture () {
    const opts = {
        argv: [path.join("assets/lambda/dist/handlers/get-all/", 'index.js'), '--my-flag', '"value for my flag"'],
        workingDir: "performance-reports"
    }
    try {
        const file = await zeroEks(opts)
        console.log(`flamegraph in ${file}`)
    } catch (e) {
        console.error(e)
    }
}

capture();