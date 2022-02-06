export default function HowTo() { 
  return <div className="howto">
    <h1>How to use</h1>
    playvis allows you to create a playlist by specifying how the 'feel' of the playlist should progress, instead of manually choosing songs to produce this progression. This done by creating a list of criteria based on desired changes in the audio features of songs. Currently these features include BPM (i.e., tempo or speed), acoustic-ness and danceability, though other features such as harmonic key will be added in the future. Essentially, it allows you to create a playlist based on criteria like ‘gets more dance-y for 5 songs without slowing down, then slows down gradually for 4 songs before finally becoming more acoustic for the next 3’.
    <br></br><br></br>
    playvis takes this list of criteria and produces a 'map', or graph, which shows paths between songs.  Each path from left to right is a potential playlist that satisfies the criteria. The final playlist is created by selecting songs from this graph, which changes with each selection to remove any songs that become unreachable after a song is selected.

    <h3>Specification</h3>
    Each 'step' in the specification corresponds to one song in the playlist. A step is made up of criteria, and each step finds all songs that fit the criteria for that position in the playlist.
    <br></br><br></br>
    Steps labelled (abs values) will find all songs that meet the criteria - e.g., 120-140 BPM with an acoustic-ness score of 0-30% and a danceability score of 40-70%.
    <br></br><br></br>
    Steps labelled (rel values) will find all songs with differences of features that are within the given range for any of the songs found in the previous step. For example, all songs that are 10-20% faster and 20-30% more danceable.
    <br></br><br></br>
    Un-checking the checkbox for an individual feature means that the constraints for that feature won’t be checked by playvis when looking for possible songs – so if you uncheck BPM for a step, only the other features will be checked when deciding if a song meets the criteria for that step.
    <br></br><br></br>
    Each step has a ‘loops’ value. This just means ‘how many times to apply this step’. Having a step loop n times has the same effect as having n copies of the step one after the other.
    <br></br><br></br>
    You can also add groups of steps, and each group also has a ‘loops’ value. If you have a group containing step-1 and step-2, and the group has ‘2’ in the loops field, it is the same as having step-1, step-2, step-1, step-2 without an enclosing group. Groups can also contain groups, which can contain groups and so on.

    <h3>Graph</h3>

    Once you are happy with your specification, you can use it to generate a graph. This is an intuitive way of seeing all the possible playlists that meet your criteria. Each layer of the graph from left to right represents a position in the playlist – the leftmost layer shows all options for the first song, the rightmost shows all options for the last. A link from one song to another song in the next layer signifies that the song linked to could follow the song linked from in the final playlist.
    <br></br><br></br>
    Songs can be selected for the final playlist in any order but will maintain the correct order in the playlist. Each time a song is selected, the graph may change. This is because some songs become unreachable – for example, if song A is followed by songs B and C, and C is selected, then song B and any song that came after it that didn’t also have a path to it from song C is removed, as well as any song that didn’t lead to song A. This prevents playlists from being created that don’t fit the criteria.

    <h3>Playlist</h3>

    Currently, the Playlist section just displays the song title, artist, and album art for your chosen songs. In the future, it will be able to play the playlist and export it back to Spotify.

  </div>
}