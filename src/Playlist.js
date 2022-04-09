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

const Playlist = ({ dag }) => {
  return dag.nodes
    .map((layer, i) => layer.length === 1
      ? <Track key={i} index={i} track={layer[0]} feats={layer[0].stepFeats} />
      : <Placeholder key={i} index={i} />
    )
}

export default Playlist

const Placeholder = ({ index }) => {
  return (
    <div className="playlisttrack"
      style={{
        backgroundColor: "#BBBBBB60",
        border: "dotted",
        borderColor: "#BBBBBB",
        borderWidth: "1px"
      }}>
      <div style={{
        height: "48px", width: "50px", display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#BBBBBB60",
        borderRadius: "5px",
      }}>
        <h1 style={{ color: "#888888" }}> ? </h1>
      </div>
      <i style={{ color: "#888888" }}>track {index + 1}</i>
    </div>)
}

const Track = ({ index, track, feats }) => {

  const { attributes, imgurl, name, stepCol } = track;
  const { features, artist } = attributes;
  const featStrings = {
    tempo: `BPM: ${features.tempo.toFixed(0)}`,
    acousticness: `Acousticness: ${(features.acousticness * 100).toFixed(3)}`,
    danceability: `Danceability: ${(features.danceability * 100).toFixed(0)}`,
    energy: `Energy: ${(features.energy * 100).toFixed(0)}`,
    key: `Key: ${features.key > -1 ? features.key : "not present"} `
  }

  return (
    <div className="playlisttrack" style={{ backgroundColor: stepCol }}>
      <img src={imgurl} height={50} width={50} alt="" style={{ borderRadius: "5px" }} />
      <div>
        {index + 1}: {name} - {artist}
        <br></br>
        <font size="1">
          {feats.map(name => featStrings[name])
            .reduce((acc, v) => [...acc, " | ", v], [])
            .slice(1)
          }
        </font>
      </div>
    </div>
  )

}