const spotify   = require('./spotify.js')
const ebay      = require('./ebay.js')
const output    = require('./output.js')
const uploader  = require('./uploader.js')
const schedule  = require('node-schedule')
 
; (async () => {
  console.log('Initial search.')
  
  await findVinyl();

  console.log('Switching to hourly searches.')

  schedule.scheduleJob('0 * * * *', function(){
    console.log(`Finding vinyl at ${new Date().toISOString()}`)
    findVinyl()
  });
})()

async function findVinyl() {
  let albums = await spotify.getAlbums()
  let results = await ebay.getVinyl(albums)

  if (results === null)
    return

  let htmlFile = await output.writeToHtml(results)
  await uploader.upload(htmlFile)
}
