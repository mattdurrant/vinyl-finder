const puppeteer = require('puppeteer');
const cheerio   = require('cheerio')
const ora       = require('ora')


async function getVinyl(albums) {
    let results = [],
    spinner   = ora(`Searching tophat for vinyl`).start()

    for (let i = 0; i < albums.length; i++) {
        let records = await getAlbums(albums[i].albumName, albums[i].artistName, spinner)    
        if (records != null) {
            for (let x = 0; x < records.length; x++) {
                results.push(records[x])
            }
        }
    }
    return results
}

async function getAlbums(albumName, artistName, spinner) {
  spinner.text = `Searching tophat for ${albumName} - ${artistName} vinyl`
  let keywords = `${albumName}+${artistName}`
  let results = []
  
  try {
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    await page.goto(`https://www.tophatrecords.co.uk/index.php?filter_Keywords_3=${keywords}&searchwordsugg=&option=com_hikashop&view=product&layout=listing&Itemid=158`)
    let content = await page.content()
    let $ = cheerio.load(content);

    let tableRows = $('tr[itemprop=itemList]')

    for (let x = 0; x < tableRows.length; x++) {
        $ = cheerio.load(tableRows[x])
        let itemProperties = $('meta[itemprop=name]').attr('content').split("-").map(item => item.trim())
        var artist = itemProperties[0]
        var title = itemProperties[1]
        let imageUrl = $('meta[itemprop=image]').attr('content').slice(0, -1)
        let price = $('span[class="hikashop_product_price hikashop_product_price_0"]').text()
        let url = $('a').attr('href')
         price = price === 'Free' ? 0 : price.substring(1)
       
        let result = {
            album: albumName,
            artist: artist,
            title: title,
            subtitle: null,
            url: url,
            imageUrl: imageUrl,
            listingType: 'FixedPrice',
            currency: '',
            price: price,
            deliveryCost: 0,
            totalPrice: price,
            endTime: null
        }
        results.push(result)
    }
    
    await browser.close()
  }  
  catch (error) {
      console.log(`Error : ${error}`)
      spinner.fail('Error searching tophat')
      return null
  }
  spinner.stop()
  return results
}

module.exports = {
    getVinyl
}