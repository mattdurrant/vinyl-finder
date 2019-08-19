const request           = require('request')
const requestPromise    = require('request-promise')
const ora               = require('ora')
const config            = require('./config.json')

async function getVinyl(albums) {
    let results = [],
        spinner   = ora(`Searching ebay for vinyl`).start()
  
    for (let i = 0; i < albums.length; i++) {
        let records = await getAlbums(albums[i].albumName, albums[i].artistName, spinner)    
        if (records != null) {
            for (let x = 0; x < records.length; x++) {
                results.push(records[x])
            }
        }
    }
    
    results = results.filter(r => r.totalPrice <= 25.0)
    
    spinner.succeed(`${results.length} vinyl records found`)
    return results
}

async function getAlbums(albumName, artistName, spinner) {
    spinner.text = `Searching ebay for ${albumName} - ${artistName} vinyl`
    albumName = albumName.replace(/ /g, ',')
    artistName = artistName.replace(/ /g, ',')
    let album = albumName + ' ' + artistName + ' -cd -cassette -7" -tote  '
    album = album.replace(/&/g, '%20')
    let keywords = encodeURI(album)

    let url = `https://svcs.ebay.com/services/search/FindingService/v1`
        + `?OPERATION-NAME=findItemsAdvanced`
        + `&SERVICE-VERSION=1.0.0`
        + `&SECURITY-APPNAME=${config.ebay.appName}`
        + `&GLOBAL-ID=EBAY-GB`
        + `&RESPONSE-DATA-FORMAT=JSON`
        + `&buyerPostalCode=${config.ebay.postcode}`
        + `&REST-PAYLOAD`
        + `&categoryId=176985`
        + `&keywords=${keywords}`
        + `&paginationInput.entriesPerPage=10`
        + `&sortOrder=PricePlusShippingLowest`
        + `&itemFilter(0).name=MaxPrice`
        + `&itemFilter(0).value=${config.ebay.maxprice}`

    let response = JSON.parse(await requestPromise(url)).findItemsAdvancedResponse[0].searchResult[0].item
    
    if (response === undefined || response === null)
        return null

    let processedResults = processResults(response)
    
    return processedResults
}

function processResults(data) {
    try {
        return data.map(x => 
            ({
                title: x.title[0],
                subtitle: (x.subtitle === undefined) ? null : x.subtitle[0],
                url: x.viewItemURL,
                imageUrl: x.galleryURL,
                listingType: x.listingInfo[0].listingType,
                currency: x.sellingStatus[0].convertedCurrentPrice[0]['@currencyId'],
                price: parseFloat(x.sellingStatus[0].convertedCurrentPrice[0].__value__).toFixed(2),
                deliveryCost: parseFloat(x.shippingInfo[0].shippingServiceCost[0].__value__).toFixed(2),
                totalPrice: (parseFloat(x.sellingStatus[0].convertedCurrentPrice[0].__value__) + parseFloat(x.shippingInfo[0].shippingServiceCost[0].__value__)).toFixed(2),
                endTime: x.listingInfo[0].endTime
            }))
    }
    catch {
        return null
    }
}

module.exports = {
    getVinyl
}