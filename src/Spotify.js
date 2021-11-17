import React from 'react';
import { SpotifyApiContext, UserPlaylists } from 'react-spotify-api';
import Cookies from 'js-cookie';

import { SpotifyAuth, Scopes } from 'react-spotify-auth';
import 'react-spotify-auth/dist/index.css'

const App = () => {
  var [token, setToken] = React.useState(Cookies.get("spotifyAuthToken"))
  return (
    <div>
      {token ? (
        <SpotifyApiContext.Provider value={token}>
          <UserPlaylists>
            {(playlists, loading, error) =>

              playlists.data ? (
                playlists.data.items.map(playlist => (
                  <h1 key={playlist.id}>{playlist.name}</h1>
                ))
              ) : null
            }
          </UserPlaylists> 
        </SpotifyApiContext.Provider>
      ) : (
        // Display the login page
        <SpotifyAuth
          redirectUri='http://localhost:3000/'
          clientID='c79989282f4f40a2953b4adc36489afc'
          scopes={[Scopes.playlistReadCollaborative, Scopes.playlistReadCollaborative]}
          onAccessToken={(token) => setToken(token)}
        />
      )}
    </div>
  )
}
export default App