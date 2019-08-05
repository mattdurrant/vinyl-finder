const request           = require('request')
const requestPromise    = require('request-promise')
const ora               = require('ora')

async function getVinyl(albums) {
    let results = [],
        spinner   = ora(`Search ebay for vinyl`).start()
  
    for (let i = 0; i < albums.length; i++) {
        let albumName = albums[i].albumName.replace(/ /g, ',')
        let artistName = albums[i].artistName.replace(/ /g, ',')
        let album = albumName + ' ' + artistName + ' -cd -cassette -7" -tote  '
        album = album.replace(/&/g, '%20')
        let keywords = encodeURI(album)

        let url = `https://svcs.ebay.com/services/search/FindingService/v1`
            + `?OPERATION-NAME=findItemsAdvanced`
            + `&SERVICE-VERSION=1.0.0`
            + `&SECURITY-APPNAME=MattDurr-VinylSea-PRD-eb447253d-60f5ced9`
            + `&GLOBAL-ID=EBAY-GB`
            + `&RESPONSE-DATA-FORMAT=JSON`
            + `&buyerPostalCode=SO239PA`
            + `&REST-PAYLOAD`
            + `&categoryId=176985`
            + `&keywords=${keywords}`
            + `&paginationInput.entriesPerPage=10`
            + `&sortOrder=PricePlusShippingLowest`
            + `&itemFilter(0).name=MaxPrice`
            + `&itemFilter(0).value=15.0`

        spinner.text = `Search ebay for ${albums[i].albumName} - ${albums[i].artistName} vinyl`
  
        let response = JSON.parse(await requestPromise(url)).findItemsAdvancedResponse[0].searchResult[0].item

        if (response === undefined || response === null)
           continue

        let processedResults = await processResults(response)
        
        results.push(processedResults[0])
    }
    spinner.succeed(`${results.length} vinyl found`)
    
    results = results.filter(r => r.totalPrice <= 20.0)
    return results
}

async function processResults(data) {
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

module.exports = {
    getVinyl
}