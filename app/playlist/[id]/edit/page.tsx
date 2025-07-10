"use client";

import { useAuth } from "@/src/context/AuthContext";
import { useState, useEffect } from "react";
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi";
import { useSpotifyFeatures } from "@/src/features/spotify/useSpotifyFeatures";
import Link from "next/link";

export default function EditPlaylist() {
	
  const { accessToken } = useAuth();
	const [tracks, setTracks] = useState<any[]>([])
	const [newPlaylist, setNewPlaylist] = useState<any[]>([]);
	const [playlistName, setPlaylistName] = useState("")
  const [spotifyId, setSpotifyId] = useState("")
  const [playlistDescription, setPlaylistDescription] = useState("")
  
  const { getPlaylist, getPlaylistTracks, unfollowPlaylist } = useSpotifyApi()!;
  const { createPlaylistAndAddSongs } = useSpotifyFeatures();
	
	useEffect(() => {
    const id = window.location.pathname.split("/")[2];
    setSpotifyId(id)
		if (!accessToken) return;
		getPlaylist(id).then((playlistData) => {
      const { total, items } = playlistData.tracks;
      setPlaylistName(`Copy of ${playlistData.name} - ${new Date().toLocaleString()}`)
      if (items?.length < total) {
        getPlaylistTracksFull(playlistData);
      } else {
        const tracks = items.map((item: Record<string, any>) => item.track)
        setTracks(tracks);
      }
    });
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accessToken])

  const getPlaylistTracksFull = (playlistData: Record<string, any>) => {
      const { total, limit, tracks } = playlistData;
      const { items } = tracks;
      const difference = total - (items?.length || 0);
      const pages = Math.ceil(difference / limit);

      let requestCounter = 0;
      let requests = []
      while (requestCounter <= pages) {
        requestCounter++
        const newRequest = getPlaylistTracks(
          spotifyId,
          requestCounter * limit
        );
        requests.push(newRequest)
      }

      Promise.all(requests).then((data) => {
        const tempArray: any[] = [];
        data?.forEach((req) => {
          req.items.forEach((item: Record<string, any>) => {
            tempArray.push(item)
          })
        })
        const fullTrackList = new Map();
        [...items, ...tempArray].forEach((item) => {
          fullTrackList.set(item.track.id, item.track)
        })
        const trackListArray: any[] = Array.from(fullTrackList.values())
        setTracks(trackListArray);
        setNewPlaylist(trackListArray)
      })
  }

	const onPlaylistNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistName(event.target.value);
  };

	const randomize = () => {
		let tempTracks = [...tracks];
		let randomPlaylist = new Map();
		while (tempTracks.length > 0) {
      let randomIndex = Math.floor(Math.random() * tracks.length);
      const randomTrack: Record<string, any> = tempTracks[randomIndex];
      if (randomTrack) randomPlaylist.set(randomTrack?.id, randomTrack);
      tempTracks.splice(randomIndex, 1);
    }
    const randomPlaylistArray: any[] = Array.from(randomPlaylist.values());
		setNewPlaylist(randomPlaylistArray);
	}

	const makePlaylist = () => {
    if (newPlaylist.length === 0) return;
		const playlistUris = newPlaylist.map((track) => track.uri);
		createPlaylistAndAddSongs(
      playlistUris,
      playlistName,
      (playlistDescription || `Alex made this playlist ${Date().toString()}`),
    );
	}

  return (
    <div className="w-full">
      <div className="flex flex-row gap-2 w-full justify-between p-5">
        <input
          type="number"
          value={newPlaylist.length}
          className="text-black mb-5 px-2 py-1"
          readOnly
        />
        <button
          className="px-4 border-white border py-0.5"
          onClick={() => randomize()}
        >
          Randomize!
        </button>
        <button
          className="bg-red-900 border-red-900 px-4 py-0.5"
          onClick={() => unfollowPlaylist(spotifyId).catch(() => window.location.pathname = "/playlist")}
        >
          Unfollow
        </button>
      </div>
      <div className="flex w-full space-between p-5 gap-2 space-between">
        <input
          style={{ color: "black" }}
          type="text"
          className="text-black px-2 py-0.5 w-full"
          onChange={onPlaylistNameChange}
          value={playlistName}
          placeholder="Playlist Name"
        />
        <button
          className="px-2 py-0.5 border border-white"
          onClick={() => makePlaylist()}
        >
          Make Playlist
        </button>
      </div>
      <div className="flex flex-row gap-2 pl-4">
        <div className="h-full max-h-[90vh] mb-8 overflow-y-scroll">
          {tracks &&
            tracks.map((track: Record<string, any>, i) => {
              const artists = track?.artists?.map((artist: Record<string, any>, i: number) => {
                return (
                  <Link key={`${artist.id}_${i}`} href={`/artist/${artist.id}`}>
                    {artist.name}
                    {i !== track.artists.length - 1 && ", "}
                  </Link>
                );
              });
              return (
                <div key={`${track.id}_${i}`}>
                  {track.name} - {artists}
                </div>
              );
            })}
        </div>
        {newPlaylist && newPlaylist.length > 0 && (
          <div className="h-full max-h-[90vh] mb-8 overflow-y-scroll">
            {newPlaylist.map((track) => {
              const artists = track?.artists
                ?.map((artist: Record<string,any>) => artist.name)
                ?.join(", ");
              return (
                <div key={track.id}>
                  {track.name} - {artists}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
