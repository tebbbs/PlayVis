import React from 'react';
import { SpotifyApiContext, UserPlaylists, User } from 'react-spotify-api';
import { SpotifyAuth, Scopes } from 'react-spotify-auth';
import SpotifyWebApi from 'spotify-web-api-js';
import 'react-spotify-auth/dist/index.css'

async function getArtists(ids, api) {
  let artists = [];
  const promises = ids.map((id) => api.getArtist(id));
  artists = await Promise.all(promises);
  return artists;
}

export const getPlaylistByID = (id, token, setSongs) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);

  var p_tracks = spotifyApi.getPlaylist(id).then(
    (data) =>  data.tracks.items.map((item) => item.track)
  );
  var p_artists = p_tracks.then(
    (tracks) =>  getArtists(tracks.map((track) => track.artists[0].id), spotifyApi)
  );
  Promise.all([p_tracks, p_artists]).then(function ([tracks, artists]) {
    setSongs(
      tracks.map((track, i) => {
        const genre = (artists[i].genres.length) === 0 ? "no genre listed" : artists[i].genres[0];
        return {
          title: track.name,
          artist: track.artists[0].name,
          genre: genre
        }
      })
    )
  })
}

export const PlaylistSelector = (props) => {
  return (
    <SpotifyApiContext.Provider value={props.token}>
      <UserPlaylists>
        {({ data }) =>
          data ? (
            <select onChange={props.onChange}>
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

export const SpotifyLogin = (props) => {
  return (
    <div>
      {props.token ? (
        <SpotifyApiContext.Provider value={props.token}>
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
          scopes={[Scopes.playlistReadCollaborative, Scopes.playlistReadCollaborative]}
          onAccessToken={
            (token) => {
              props.setToken(token);

            }}
        />
      )}
    </div>
  )
}

