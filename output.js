const fs        = require('fs');
const config    = require('./config.json')

async function writeToHtml(results) {
    let filename = config.filename
    let stream = fs.createWriteStream(filename)

    await stream.once('open', function(fd) {
        let html = buildHtml(results)
        stream.end(html)
    })

    return filename
}

function buildHtml(results) {
    let header = `<link rel="stylesheet" type="text/css" href="http://www.mattdurrant.com/wp-content/themes/independent-publisher/style.css?ver=4.9.10">`
    header += `<link rel='stylesheet' id='genericons-css'  href='http://www.mattdurrant.com/wp-content/themes/independent-publisher/fonts/genericons/genericons.css?ver=3.1' type='text/css' media='all' />`
    header += `<link rel='stylesheet' id='customizer-css'  href='http://www.mattdurrant.com/wp-admin/admin-ajax.php?action=independent_publisher_customizer_css&#038;ver=1.7' type='text/css' media='all' />`
    header += `<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>`
    header += `<script type="text/javascript">function setEndTimes() { var endTimes = document.getElementsByClassName("endTime"); for (i = 0; i < endTimes.length; i++) { endTimes[i].innerHTML = 'Ends ' + moment(endTimes[i].innerHTML).fromNow() + '.'; } } window.onload = setEndTimes;</script>`

    let body = `<div id="page" class="site"><div class="entry-content e-content"><header class="entry-header"><h1 class="entry-title p-name">Vinyl Finder</h1></header>`
    body += `<table border="1"><tbody>`

    results = results.sort(
        function(a, b) {
          return a.totalPrice - b.totalPrice
        })

    for (let i = 0; i < results.length; i++) {
        body += `<tr>`
        body += `<td class="normal" style="vertical-align:top"><img src="${results[i].imageUrl}"></td>`
        body += `<td class="normal" style="vertical-align:top"><a href="${results[i].url}">${results[i].title}</a><br />`
        if (results[i].subtitle !== null)
            body += `${results[i].subtitle}<br />`
        body += `&pound;${results[i].totalPrice}<br />${results[i].listingType}. <span class="endTime">${results[i].endTime}</span></td>`
        body += `</tr>`
    }
    body += `</tbody></table></div></div>`

    return '<!DOCTYPE html>'
         + '<html><head>' + header + '</head><body class="home blog no-post-excerpts hfeed h-feed" itemscope="itemscope" itemtype="http://schema.org/WebPage">' + body + '</body></html>';
}

module.exports = {
    writeToHtml
}