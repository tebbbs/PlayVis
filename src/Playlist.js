
const Playlist = ({ dag }) => {
  // TODO: get checked features from steps via links
  return dag.nodes
    .flat()
    .filter(n => n.isClicked)
    .map((track, i) => <Track key={i} track={track} />);
}

export default Playlist

const Track = ({ track }) => {

  const { attributes, imgurl, name, stepCol } = track;
  const { features, artist } = attributes;
  

  return (
    <div className="playlisttrack" style={{ backgroundColor: stepCol }}>
      <img src={imgurl} height={50} width={50} alt="" style={{ borderRadius: "5px" }} />
      <div>
      {name} - {artist}
      <br></br>
      <font size="1">
        {`BPM: ${features.tempo.toFixed(0)} |
          Acousticness: ${(features.acousticness * 100).toFixed(3)} |
          Danceability: ${(features.danceability * 100).toFixed(0)} |
          Energy: ${(features.energy * 100).toFixed(0)} |
          Key: ${features.key > -1 ? features.key : "not present"} `}
          </font>
      </div>
    </div>
  )

}