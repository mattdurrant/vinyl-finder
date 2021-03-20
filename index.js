const ebay            = require('./ebay.js')
const albumRepository = require('./album-repository')
const ebayRepository  = require('./ebay-repository')
 
; (async () => {
  await findVinyl();
})()

async function findVinyl() {
  try {
    let albums = await albumRepository.loadAlbums()
    let items = await ebay.getVinyl(albums)
    
    if (items === null)
      return
    
    console.log(items)

    await ebayRepository.insert(items)
  }
  finally {
    process.exit()
  }
}
