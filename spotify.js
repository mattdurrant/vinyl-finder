const config        = require('./config.json')
const SpotifyWebApi = require('spotify-web-api-node')
const ora           = require('ora')

let spotifyApi = new SpotifyWebApi({
    clientId:         config.spotify.api.clientId,
    clientSecret:     config.spotify.api.clientSecret
})

async function getAlbums() {
    await setSpotifyCredentials()
    let playlistIds = config.spotify.playlistIds.split(',')
    let albums = []

    for (let i = 0; i < playlistIds.length; i++) {
      let playlistId = playlistIds[i]
      
      let playlistData = await getPlaylist(playlistId),
        results   = [], 
        pageSize  = 100,
        spinner   = ora(`Loading playlist ${playlistData.name}`).start()
    
      for(let offset = 0; offset < playlistData.totalTracks; offset += pageSize) {
        spinner.text = `Loading tracks ${offset}-${Math.min(offset + pageSize, playlistData.totalTracks)} of ${playlistData.totalTracks} for '${playlistData.name}'.`
        let tracks = await getPlaylistTracksPage(playlistId, offset, pageSize) 
    
        for (let track of tracks) {
          if (track.albumId === null) 
            continue
          
          if (results.findIndex(r => r.albumId === track.albumId) === -1) {
            results.push({ albumId: track.albumId, tracks: [], totalTracks: track.totalTracks, percentage: null, albumName: track.albumName, artistName: track.artistName })
          }
    
          let index = results.findIndex(r => r.albumId === track.albumId)
          if(results[index].tracks.indexOf(track.trackNumber) === -1)
          {
            results[index].tracks.push(track.trackNumber)
            results[index].tracks = results[index].tracks.sort((a, b) => a - b)
            results[index].percentage = (results[index].tracks.length / track.totalTracks) * 100
          }
        }
      }
      spinner.succeed(`${playlistData.totalTracks} tracks for '${playlistData.name}' loaded.`)
      
      let processedResults = process(results)
      albums = albums.concat(processedResults)
    }
    
    return albums
}

async function setSpotifyCredentials() {
    await spotifyApi
        .clientCredentialsGrant()
        .then(function(data) {
        spotifyApi.setAccessToken(data.body['access_token'])
    })  
}

async function getPlaylist(playlistId) {
    let data = await spotifyApi.getPlaylist(config.spotify.username, playlistId)

    return {
        name:        data.body.name,
        owner:       data.body.owner.display_name,
        totalTracks: data.body.tracks.total,
        description: data.body.description,
        url:         data.body.external_urls.spotify
    }
}

async function getPlaylistTracksPage(playlistId, offset, pageSize) {
    let data = await spotifyApi
        .getPlaylistTracks(config.spotify.username, playlistId, {
          offset:   offset,
          limit:    pageSize,
          fields:   'items'
        })

    return data.body.items.map(x => 
    ({
        trackName:    x.track.name,
        albumName:    x.track.album.name,
        albumId:      x.track.album.id,
        trackNumber : x.track.track_number,
        totalTracks:  x.track.album.total_tracks,
        artistName:   (x.track.album.artists.length > 0) ? x.track.album.artists[0].name : 'Unknown'
    }))
}

function process(results) {
  results = results.filter(r => r.totalTracks >= config.minimumTrackLength).sort(
    function(a, b) {
      if (a.percentage !== b.percentage) 
         return b.percentage - a.percentage
      return b.tracks.length - a.tracks.length
    }).slice(0, config.albumsInList)
    
    return results.map(x => 
    ({
        albumName:    x.albumName,
        artistName:   x.artistName
    })) 
}

module.exports = {
  getAlbums
}
