/*
 * Created on Sat Apr 09 2022
 *
 * The MIT License (MIT)
 * Copyright (c) 2022 Joseph Tebbett, University of Birmingham
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { SpotifyAuth, Scopes } from 'react-spotify-auth';
import SpotifyWebApi from 'spotify-web-api-js';
import 'react-spotify-auth/dist/index.css'

export const exportPlaylist = async (songs, token) => {

  // generate name for playlist
  const d = new Date();
  const dateTime = `${d.getUTCDate()}/${d.getUTCMonth() + 1}, ${d.getHours()}:${d.getMinutes()}`
  const name = "PlayVis playlist " + dateTime;
  const description = "A playlist created in PlayVis";

  // initialise API, get current user
  const api = new SpotifyWebApi();
  api.setAccessToken(token);
  const user = await api.getMe();

  // create playlist and add songs
  const playlist = await api.createPlaylist(user.id, { name, description });
  const uris = songs.map(song => "spotify:track:" + song.trackid);
  await api.addTracksToPlaylist(playlist.id, uris)
}

export const fetchSongs = async (token) => {

  if (["DEMO0", "DEMO1", "DEMO2"].includes(token)) {
    const demoSongs = require("./demoSongs.json");
    const index = Number(token.slice(-1));

    return [demoSongs, demoSongs.slice(0, 250), demoSongs.slice(250)][index]

  }

  const limit = 50; // max tracks per api call for Spotify
  const api = new SpotifyWebApi();
  api.setAccessToken(token);

  const tracks = await getAllUserTracks(api, limit);
  const features = await getFeatures(tracks, api, limit);
  const songs = tracks.map((track, i) =>
  ({
    id: track.track.id,
    track: track.track,
    features: features[i]
  }));

  return songs;
}

export const getFeatures = async (songs, spotifyApi, limit) => {
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

export const getAllUserTracks = async (spotifyApi, limit) => {
  const { total } = await spotifyApi.getMySavedTracks();
  let offsets = []
  // i < 500 to prevent rate limiting
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

export const SpotifyLogin = (props) => {

  const [uri, noCookie] = process.env.NODE_ENV === "development"
    ? ["http://localhost:3000/", false]
    : ["https://playvis.web.app/", true];

  return (

    // Display the login page
    <SpotifyAuth
      {...props}
      redirectUri={uri}
      noCookie={noCookie}
      clientID='c79989282f4f40a2953b4adc36489afc'
      scopes={[
        Scopes.playlistReadCollaborative,
        Scopes.playlistModifyPrivate,
        Scopes.playlistModifyPublic,
        Scopes.userLibraryRead]}
      onAccessToken={props.setToken}
    />
  )
}

