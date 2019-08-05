const spotify   = require('./spotify.js')
const ebay      = require('./ebay.js')
const output    = require('./output.js')
const uploader  = require('./uploader.js')

; (async () => {
  let albums = await spotify.getAlbums()
  let results = await ebay.getVinyl(albums)

  if (results === null)
    return

  let htmlFile = await output.writeToHtml(results)
  await uploader.upload(htmlFile)
})()
