const fs        = require('fs').promises
const config    = require('./config.json')
const moment    = require('moment')
const cheerio   = require('cheerio')

async function writeToHtml(results) {
    let filename = config.filename
    
    let albumsHtml = `<table id="results"><tr><th></th><th>Title</th><th>Price</th><th class="endTimeColumn">Ending</th></tr>`

    results = results.sort(
        function(a, b) {
          return a.totalPrice - b.totalPrice
        })

    for (let i = 0; i < results.length; i++) {
        albumsHtml += `<tr>`
        albumsHtml += `<td class="cover"><img src="${results[i].imageUrl}"></td>`
        albumsHtml += `<td class="title"><a href="${results[i].url}">${results[i].album} - ${results[i].artist}</a><br />`
        albumsHtml += `${results[i].title}`
        if (results[i].subtitle !== null)
            albumsHtml += `${results[i].subtitle}<br />`
        albumsHtml += `${results[i].listingType == 'StoreInventory' || results[i].listingType == 'FixedPrice' ? '<div class="buyItNow">Buy It Now</div>' : '<div class="auction">Auction</div>' }`
        albumsHtml += `</td>`
        albumsHtml += `<td class="price">&pound;${results[i].totalPrice}</td>`
        albumsHtml += `<td class="endTime">${results[i].endTime === null ? 'No end date' :  results[i].endTime}</td>`
        albumsHtml += `</tr>`
    }
    albumsHtml += `</table>`

    let html = await buildHtml(albumsHtml)
    fs.writeFile(filename, html)
    return filename
}

async function buildHtml(albumsHtml) {
    const html = await fs.readFile("template.html", "binary");
    const $ = cheerio.load(html)  
    $('.contentGoesHere').replaceWith(albumsHtml)
    $('.renderedDataGoesHere').replaceWith(`${moment().format('DD/MM/YY hh:mm a')}`)
    return $.html()
}

module.exports = {
    writeToHtml
}
