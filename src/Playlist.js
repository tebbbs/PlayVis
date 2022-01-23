

const Playlist = ({ tracks }) => {

  return (
    <>
      {tracks.map((track, i) => <Track key={i} track={track}/>)}
    </>
  )

}

export default Playlist

const Track = ({ track }) => {

  if (!track) return <div> </div>

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