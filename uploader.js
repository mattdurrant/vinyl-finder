
const ftp       = require("basic-ftp")
const fs        = require("fs") 
const ora       = require('ora')
const config    = require('./config.json')

async function upload(fileName) {
    spinner   = ora(`Uploading ${fileName} via FTP.`).start()
  
    const client = new ftp.Client()
    try {
        await client.access({
            host: config.website.ftp.host,
            user: config.website.ftp.username,
            password: config.website.ftp.password,
        })
        await client.cd(`public_html`)
        await client.upload(fs.createReadStream(fileName), fileName)
        spinner.succeed(`${fileName} uploaded.`)
    }
    catch(err) {
        spinner.fail(`${fileName} failed to upload.`)
    }   
    
    client.close()
}

module.exports = {
    upload
}