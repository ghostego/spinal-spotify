import Image from "next/image"
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi";
import { useEffect, useState } from "react"
import SlideOutSidebar from "../SlideOutSidebar";

export default function SearchResultInfo({
  result,
  playlistSongs,
  setPlaylistSongs,
}: {
  result: Record<string, any>;
  playlistSongs: Record<string, any>[];
  setPlaylistSongs: ([]: Record<string, any>) => void;
}) {
  const [topTracks, setTopTracks] = useState([]);
	const [artistAlbums, setArtistAlbums] = useState([])
	const [albumInfo, setAlbumInfo] = useState<Record<string, any>>({})
	const [isAlbumInfoOpen, setIsAlbumInfoOpen] = useState(false)
  const { getArtistTopTracks, getArtistAlbums, getAlbum } = useSpotifyApi();

  useEffect(() => {
		if (Object.keys(result).length == 0) return;
    getArtistTopTracks(result.id).then((data) => {
      setTopTracks(data.tracks);
    });
		getArtistAlbums(result.id).then((data) => {
			setArtistAlbums(data.items)
    });
  }, [result]);

  useEffect(() => {
    if (!isAlbumInfoOpen) setAlbumInfo({})
  }, [isAlbumInfoOpen]);

	const updatePlaylistSongs = (track: Record<string, any>) => {
		const tempSongs = [...playlistSongs];
		const songMatchIndex = tempSongs.findIndex((tempSong) => tempSong.id === track.id )
		if (songMatchIndex === -1) {
			tempSongs.push(track);
			setPlaylistSongs(tempSongs)
		} else {
			const filteredSongs = tempSongs.filter((tempSong) => tempSong.id !== track.id)
			setPlaylistSongs(filteredSongs)
		}
	}

	const updateAlbumInfo = (album: Record<string, any>) => {
    getAlbum(album.id).then((data) => {
      setAlbumInfo(data);
      setIsAlbumInfoOpen(true);
    });
  };

  const albumHeader = (albumInfo: Record<string, any>) => {
    if (!albumInfo.images) return <div></div>;
    return (
      <div className="flex items-center gap-x-2">
        <Image
          src={albumInfo.images[0].url}
          alt={albumInfo.name}
          width={240}
          height={240}
        />
        {albumInfo.name}
        <br />
        {albumInfo.artists
          .map((artist: Record<string, any>) => artist.name)
          .join(", ")}
      </div>
    );
  };

	const songInPlaylist = (track: Record<string, any>) =>
    playlistSongs.findIndex((playlistSong) => playlistSong.id === track.id) >
    -1;

	if (Object.keys(result).length === 0) return <div>No results :(</div>

  return (
    <div className="flex flex-col gap-y-4 relative p-4">
      {topTracks.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topTracks.map((track: Record<string, any>) => {
            return (
              <div
                key={track.id}
                onClick={() => updatePlaylistSongs(track)}
                className={`p-2 border border-white flex-1/2 hover:bg-white hover:text-black transitional-all ${
                  songInPlaylist(track) ? "bg-red-900" : ""
                }`}
              >
                {track.name}
              </div>
            );
          })}
        </div>
      )}
      {artistAlbums.length > 0 &&
        artistAlbums.map((album: Record<string, any>) => {
          const image = album.images[0];
          return (
            <div
              className="flex items-center gap-x-2 border border-white"
              key={album.id}
              onClick={() => updateAlbumInfo(album)}
            >
              <Image src={image.url} alt={album.name} width={64} height={64} />
              {album.name}
            </div>
          );
        })}
      <SlideOutSidebar
        isOpen={isAlbumInfoOpen}
        onClose={() => {
          setIsAlbumInfoOpen(false);
          setAlbumInfo({});
        }}
        header={albumHeader(albumInfo)}
      >
        {Object.keys(albumInfo).length > 0 && (
          <div className="flex flex-col gap-y-2 p-4">
            {albumInfo?.tracks?.items.map((song: Record<string, any>) => {
              return (
                <div
                  key={song.id}
                  onClick={() => updatePlaylistSongs(song)}
                  className={`flex items-center gap-x-2 border border-white justify-between p-4 ${
                    songInPlaylist(song) ? "bg-red-900" : ""
                  }`}
                >
                  <div className="flex gap-x-2 items-center">
                    {song.name} -{" "}
                    {song.artists
                      .map((artist: Record<string, any>) => artist.name)
                      .join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SlideOutSidebar>
    </div>
  );
}