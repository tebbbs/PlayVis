import { SpotifyAuth, Scopes } from 'react-spotify-auth';
import SpotifyWebApi from 'spotify-web-api-js';
import 'react-spotify-auth/dist/index.css'

export const getFeatures = async (songs, token) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  const limit = 20;

  let trackIds = []
  for (let i = 0; i < songs.length; i += limit)
        trackIds.push(songs
          .slice(i, i + limit)
          .map(song => song.track.id))

  const features = await trackIds.reduce(async (prevProm, ids) => {
    const prevRes = await prevProm;
    return spotifyApi.getAudioFeaturesForTracks(ids)
    .then(data => data.audio_features)
    .then(response => [...prevRes, ...response])
  }, Promise.resolve([]));

  return features;

}

export const getAllUserTracks = async (token) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  // get all tracks in 50 track chunks (limited by spotify API)

  const limit = 50;

  const { total } = await spotifyApi.getMySavedTracks();

  let offsets = []
  for (let i = 0; i < total && i < 500; i += limit)
    offsets.push(i);

  const tracks = await offsets.reduce(async (prevPromise, offset) => {
    let prevRes = await prevPromise;
    return spotifyApi
      .getMySavedTracks({ offset, limit })
      .then(data => data.items)
      .then(response => [...prevRes, ...response])
  }, Promise.resolve([]));

  let artistIDs = [];
  for (let i = 0; i < tracks.length; i += limit)
    artistIDs.push(tracks
      .slice(i, i + limit)
      .map(t => t.track.artists[0].id))

  const artists = await artistIDs.reduce(async (prevPromise, ids) => {
    let prevRes = await prevPromise;
    return spotifyApi
      .getArtists(ids)
      .then(data => data.artists)
      .then(response => [...prevRes, ...response])
  }, Promise.resolve([]));

  return tracks.map((t, i) => ({
    added_at: t.added_at,
    track: { ...t.track, fullArtist: artists[i] }
  }));


}

export const getAllUserTracksParallel = async (token) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  const limit = 50;

  // get all tracks in 50 track chunks (limited by spotify API)

  const { total } = await spotifyApi.getMySavedTracks();

  let pTracks = [];
  // i < 200 because of spotify rate limiting
  for (let i = 0; i < total && i < 200; i += limit)
    pTracks.push(
      spotifyApi
        .getMySavedTracks({ offset: i, limit })
        .then(data => data.items)
    )
  const tracks = await Promise.all(pTracks).then(results => results.flat());

  let pArtists = [];
  for (let i = 0; i < tracks.length; i += limit)
    pArtists.push(
      spotifyApi
        .getArtists(tracks
          .slice(i, i + limit)
          .map(t => t.track.artists[0].id))
        .then(data => data.artists)
    )

  const artists = await Promise.all(pArtists).then(results => results.flat());

  return tracks.map((t, i) => ({
    added_at: t.added_at,
    track: { ...t.track, fullArtist: artists[i] }
  }));


}



export const SpotifyLogin = ({ setToken }) => {

  const [uri, noCookie] = process.env.NODE_ENV === "development"
    ? ["http://localhost:3000/", false]
    : ["https://playvis.web.app/", true];

  return (
    // Display the login page
    <SpotifyAuth
      redirectUri={uri}
      noCookie={noCookie}
      clientID='c79989282f4f40a2953b4adc36489afc'
      scopes={
        [Scopes.playlistReadCollaborative,
        Scopes.userLibraryRead]}
      onAccessToken={setToken}
    />
  )
}

