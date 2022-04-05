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
        borderColor: "#BBBBBB"
      }}>
      <div style={{
        height: "50px", width: "50px", display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#BBBBBB60",
        borderRadius: "5px"
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