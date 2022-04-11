# How to run

All source code is available in this folder, along with demoSongs.json which contains the Spotify API data for 500 songs from my library.

PlayVis is a webapp, so should be served by a server and accessed in a browser.

The code has been built, and can be served from the folder ./build with any webserver, e.g. `serve` or `lite-server`, both of which are available from npm (Node Package Manager).

Alternatively, the code found in ./build is hosted at [playvis.web.app](https://playvis.web.app). 

As a last resort, the results of right-click -> save on the open web app in chrome can be opened by double-clicking playvis.html. I have not fully tested this option but it seems to work. Spotify integration is not available, but the demo songs are.