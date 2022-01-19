

const Playlist = ({ tracks }) => {

  return (
    <>
      {tracks.map((track, i) => <Track key={track.trackid + i} track={track}/>)}
    </>
  )

}

export default Playlist

const Track = ({ track }) => {

  const { attributes, imgurl, name } = track;
  const artist = attributes.artist;

  return (
    <div style={{
      backgroundColor: "white",
      margin: "2px"
    }}>
      <img src={imgurl} height={50} width={50} alt="" />
      {name} - {artist}
    </div>
  )

}