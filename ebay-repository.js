const mysql     = require('mysql2/promise')
const config    = require('./config.json')

async function insert(items) {
    try {
        const connection = await mysql.createConnection({
            host: config.mysql.host,
            port: config.mysql.port,
            user: config.mysql.user,
            password: config.mysql.password,
            database: config.mysql.database    
        })

        let deleteSql = `DELETE FROM homepage.ebay;`
        await connection.query(deleteSql)

        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemJson = mysql.escape(JSON.stringify(item))
            let sql = `INSERT INTO homepage.ebay (itemId, item, updated) VALUES ('${item.itemId}', ${itemJson}, UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE item = ${itemJson}, updated = UTC_TIMESTAMP()`
            await connection.query(sql)
        }
    }
    catch (exception) {
        console.log(exception)
    }
}

module.exports = {
    insert
}