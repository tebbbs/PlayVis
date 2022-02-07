
const Playlist = ({ dag }) => {
  return dag.nodes
    .flat()
    .filter(n => n.isClicked)
    .map((track, i) => <Track key={i} track={track} />);
}

export default Playlist

const Track = ({ track }) => {

  const { attributes, imgurl, name, stepCol } = track;
  const { bpm, acous, dance, artist } = attributes;

  return (
    <div className="playlisttrack" style={{ backgroundColor: stepCol}}>
      <img src={imgurl} height={50} width={50} alt="" style={{ borderRadius: "5px" }} />
      <div>
      {name} - {artist}
      <br></br>
      <font size="1">{`BPM: ${bpm.toFixed(0)} - Acousticness: ${(acous * 100).toFixed(3)} - Danceability: ${(dance * 100).toFixed(0)}`}</font>
      </div>
    </div>
  )

}