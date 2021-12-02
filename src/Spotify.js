import React from 'react';
import { SpotifyApiContext, UserPlaylists, User } from 'react-spotify-api';
import { SpotifyAuth, Scopes } from 'react-spotify-auth';
import SpotifyWebApi from 'spotify-web-api-js';
import 'react-spotify-auth/dist/index.css'

const simpleTrackObj = (track, artist) => {
  const genre = (artist.genres.length) === 0 ? "no genre listed" : artist.genres[0];
  return {
    title: track.name,
    artist: track.artists[0].name,
    genre: genre
  }
}

export async function getPlaylistByID(id, token) {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  const tracks = await spotifyApi.getPlaylist(id)
    .then(({ tracks }) => tracks.items.map((item) => item.track));
  const artists = await Promise.all(tracks.map((track) => spotifyApi.getArtist(track.artists[0].id)));
  return tracks.map((track, i) => simpleTrackObj(track, artists[i]));
}

export const TrackList = ({ songs }) => {
  return (
    <h3>tracks go here</h3>
    //songs.map((item) => <span>{item.track.name}</span>)

  )
}

export async function getFeatures(songs, token) {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  const limit = 50;
  let promises = [];
  for (let i = 0; i < songs.length; i += limit)
    promises.push(spotifyApi.getAudioFeaturesForTracks(
      songs.slice(i, i + limit).map((song) => song.track.id)));

  return Promise.all(promises)
    .then((featuresList) => [].concat.apply([], featuresList.map((data) => data.audio_features)));
}

export const getAllUserTracks = (token) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  const limit = 50;

  // get all tracks in 50 track chunks (limited by spotify API)
  return spotifyApi.getMySavedTracks()
    .then((data) => data.total)
    .then((total) => {
      let promises = []
      // i < 1000 because of spotify rate limiting
      for (let i = 0; i < total && i < 1000; i += limit)
        promises.push(
          spotifyApi.getMySavedTracks({ offset: i, limit: limit })
            .then((data) => data.items)
        )
      return Promise.all(promises)
    })
    .then((trackLists) =>
      [].concat.apply([], trackLists)
    )
}

export const PlaylistSelector = ({ token, onChange }) => {
  return (
    <SpotifyApiContext.Provider value={token}>
      <UserPlaylists>
        {({ data }) =>
          data ? (
            <select onChange={onChange}>
              {data.items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>))
              }
            </select>
          ) : null
        }
      </UserPlaylists>
    </SpotifyApiContext.Provider>
  )
}

export const SpotifyLogin = ({ token, setToken }) => {
  return (
    <div>
      {token ? (
        <SpotifyApiContext.Provider value={token}>
          <User>
            {({ data }) =>
              data ? (
                <span>{data.display_name} logged in</span>
              ) : null
            }
          </User>
        </SpotifyApiContext.Provider>
      ) : (
        // Display the login page
        <SpotifyAuth
          redirectUri='http://localhost:3000/'
          //redirectUri='https://playvis.web.app/'
          clientID='c79989282f4f40a2953b4adc36489afc'
          scopes={
            [Scopes.playlistReadCollaborative,
            Scopes.userLibraryRead]}
          onAccessToken={(t) => setToken(t)}
        />
      )}
    </div>
  )
}

