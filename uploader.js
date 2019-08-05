
const ftp   = require("basic-ftp")
const fs    = require("fs") 
const ora   = require('ora')

async function upload(fileName) {
    spinner   = ora(`Uploading ${fileName} via FTP.`).start()
  
    const client = new ftp.Client()
    try {
        await client.access({
            host: "ftp.mattdurrant.com",
            user: "mattdurrant.com",
            password: "fRh^qHrjw",
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