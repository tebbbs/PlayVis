import React from 'react';
import { SpotifyApiContext, UserPlaylists, User } from 'react-spotify-api';
import { SpotifyAuth, Scopes } from 'react-spotify-auth';
import SpotifyWebApi from 'spotify-web-api-js';
import 'react-spotify-auth/dist/index.css'

export const getPlaylistByID = (id, token, setSongs) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);
  // This feels like a hacky way to get around async problem
  spotifyApi.getPlaylist(id).then(
    function (data) {
      setSongs(data.tracks.items.map((item) => {
        return { title: item.track.name, artist: item.track.artists[0].name };
      }));
    },
    function (err) {
      console.log(err);
    }
  );
}

export const PlaylistSelector = (props) => {
  return (
    <SpotifyApiContext.Provider value={props.token}>
      <UserPlaylists>
        {({ data }) =>
          data ? (
            <select onChange={props.setPlaylistID}>
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
  const token = props.token;
  const setToken = props.setToken;
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
          //redirectUri='http://localhost:3000/'
          redirectUri='https://playvis.web.app/'
          clientID='c79989282f4f40a2953b4adc36489afc'
          scopes={[Scopes.playlistReadCollaborative, Scopes.playlistReadCollaborative]}
          onAccessToken={
            (token) => {
              setToken(token);
              props.setToken(token)
            }}
        />
      )}
    </div>
  )
}

