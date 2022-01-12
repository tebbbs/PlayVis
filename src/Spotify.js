import React from 'react';
import { SpotifyApiContext, User } from 'react-spotify-api';
import { SpotifyAuth, Scopes } from 'react-spotify-auth';
import SpotifyWebApi from 'spotify-web-api-js';
import 'react-spotify-auth/dist/index.css'

export async function getFeatures(songs, token) {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  const limit = 50;
  let promises = [];
  for (let i = 0; i < songs.length; i += limit)
    promises.push(spotifyApi.getAudioFeaturesForTracks(
      songs.slice(i, i + limit).map((song) => song.track.id)));

  return Promise.all(promises)
    .then((featuresList => featuresList.flatMap(data => data.audio_features)));

}

export async function getAllUserTracks(token) {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  const limit = 50;

  // get all tracks in 50 track chunks (limited by spotify API)

  const { total } = await spotifyApi.getMySavedTracks();
  let promises = [];
  // i < 200 because of spotify rate limiting
  for (let i = 0; i < total && i < 200; i += limit)
    promises.push(
      spotifyApi.getMySavedTracks({ offset: i, limit })
        .then(data => data.items)
    )
  const tracksLists = await Promise.all(promises);
  const tracks = tracksLists.flat();
  const artists = await Promise.all(
    tracks.map(({ track }) => spotifyApi.getArtist(track.artists[0].id)));
  return tracks.map((t, i) => ({
    added_at: t.added_at,
    track: { ...t.track, fullArtist: artists[i] },
  }));

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

