"use client"

import { useSpotifyApi } from "@/src/hooks/useSpotifyApi";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { batchRequests } from "@/src/utils/batchRequests";
import { getRandomResults } from "@/src/utils/getRandom";
import Image from "next/image"
import Link from "next/link"

export default function UserProfile() {

	const { accessToken } = useAuth()!;
	const { getUserProfile, getUserPlaylists, getPlaylistTracks } = useSpotifyApi()!;

	const [profile, setProfile] = useState<any>({});
	const [topArtists, setTopArtists] = useState<any>([]);
	const [topTracks, setTopTracks] = useState<any>([]);
	const [playlists, setPlaylists] = useState([]);

	useEffect(() => {
    if (!accessToken) return;
    const id = window.location.pathname.split("user/")[1];
    getUserProfile(id).then((x) => {
      setProfile(x);
    });
    getUserPlaylists(id).then((x) => {
      const playlists = x.items;
      setPlaylists(playlists);
      getAndSetPlaylistTracks(playlists);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

	const getAndSetPlaylistTracks = async (playlists: []) => {
		const MAX_SEARCH = 10;
		const randomResults = getRandomResults(
			Object.values(playlists),
			MAX_SEARCH
		);
		if (!accessToken) return;
		const requestedTrackData: Record<string, any> = {};

		const playlistRequests = randomResults.map((result) => {
			requestedTrackData[result.name] = result;
			return () => getPlaylistTracks(result.id);
		});

		// Throttle search requests
		const playlistResponses = await batchRequests(playlistRequests, 5);
		const artistCounter: Record<string, any> = {}
		const trackCounter: Record<string, any> = {}
		playlistResponses.forEach((res) => {
			res.items.forEach((item: Record<string, any>) => {
				const trackName = item.track.name
				if (trackCounter[trackName]) {
					trackCounter[trackName].counter++;
				} else {
					trackCounter[trackName] = item.track
					trackCounter[trackName].counter = 1;
				}
				item.track.artists.forEach((artist: Record<string, any>) => {
					if (artistCounter[artist.name]) {
						artistCounter[artist.name].counter++;
					} else {
						artistCounter[artist.name] = artist;
						artistCounter[artist.name].counter = 1;
					}
				});
			})
		})
    if (!artistCounter || !trackCounter) return;
		const arrangedArtists: Record<string, any>[] = Object.values(artistCounter).sort((a,b) => b.counter - a.counter).splice(0, 10)
		const arrangedTracks: Record<string, any>[] = Object.values(trackCounter)
      .sort((a, b) => b.counter - a.counter)
      .splice(0, 10);
		setTopArtists(arrangedArtists)
		setTopTracks(arrangedTracks)
	}

	return (
    <div className="p-4 pb-0 w-full max-h-screen h-full overflow-y-hidden flex flex-col space-between">
      <div className="flex gap-4 border border-white p-4 justify-between items-center h-[20vh] overflow-hidden">
        <div className="flex gap-4">
          {profile?.images?.[0].url && (
            <Image
              alt={profile?.display_name || ""}
              src={profile?.images?.[0].url || ""}
              height={100}
              width={100}
              priority
            />
          )}
          <div className="flex flex-col gap-1 justify-center">
            <h4 className="text-sm">{profile?.id}</h4>
            <h2 className="text-lg mb-0.5">{profile?.display_name}</h2>
            <h4 className="text-xs">{profile?.followers?.total} followers</h4>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link className="btn" href={profile?.external_urls?.spotify || ""}>
            Spotify Profile
          </Link>
          <Link className="btn" href={"/playlist"}>
            View Playlists
          </Link>
        </div>
      </div>
      <div className="flex gap-4 items-end">
        {topArtists?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/3 h-full overflow-y-scroll max-h-[70vh] pb-4">
            <div className="flex justify-between">
              <p className="text-xs">
                I can`t see this users top artists, but based on 10 of their
                random playlists, here are some repeat artists.
              </p>
            </div>
            <ul>
              {topArtists &&
                topArtists.map((artist: Record<string, any>, i) => {
                  return (
                    <li key={artist.id}>
                      <Link
                        href={`/artist/${artist.id}`}
                        className="flex flex-row gap-2 border border-white space-between mb-2 items-center pr-2 hover:bg-white hover:text-black cursor-pointer transition-all relative h-20 p-4"
                      >
                        <div className="absolute px-1 py-0.5 bg-green-900 text-white text-xs top-0 left-0">
                          {i + 1}
                        </div>
                        {artist.name} appears {artist.counter} times
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
        {topTracks?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/3 h-full overflow-y-scroll max-h-[70vh] pb-4">
            <div className="flex justify-between">
              <p className="text-xs">
                I can`t see this users top songs, but based on 10 of their
                random playlists, here are some repeat tracks.
              </p>
            </div>
            <ul>
              {topTracks &&
                topTracks?.map((song: Record<string, any>, i) => {
                  const artists = song.artists
                    .map((artist: Record<string, any>) => artist.name)
                    .join(",");
                  return (
                    <Link
                      href={song.external_urls.spotify}
                      key={song.id}
                      className="flex flex-row gap-2 border border-white space-between mb-2 items-center pr-2 hover:bg-white hover:text-black transition-all relative p-4 h-[82px]"
                    >
                      <div className="absolute px-1 py-0.5 bg-green-900 text-white text-xs top-0 left-0">
                        {i + 1}
                      </div>
                      {song.name} - {artists} - {song.counter} times
                    </Link>
                  );
                })}
            </ul>
          </div>
        )}
        {playlists?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/3 h-full overflow-y-scroll max-h-[70vh] pb-4">
            <h3 className="text-lg">Playlists</h3>
            <ul>
              {playlists &&
                playlists?.map((playlist: Record<string, any>, i) => {
                  return (
                    <Link
                      key={playlist.id}
                      className="flex flex-row gap-2 border border-white space-between mb-2 items-center pr-2 hover:bg-white hover:text-black transition-all relative p-4 h-[82px]"
                      href={`/playlist/${playlist.id}/edit`}
                    >
                      <div className="absolute px-1 py-0.5 bg-green-900 text-white text-xs top-0 left-0">
                        {i + 1}
                      </div>
                      {playlist.name}
                    </Link>
                  );
                })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}