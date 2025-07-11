'use client'

import { useEffect, useState } from "react"
import { init, access, refreshAccessTokenFromStorage } from "@/src/hooks/init";
import { useAuth } from "@/src/context/AuthContext"
import { setStorageWithExpiration, getStorage, setStorage } from "@/src/utils/localStorage";
import Image from "next/image";
import Link from "next/link";
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi"

export default function Home() {
  const [topArtistTimeFrame, setTopArtistTimeFrame] = useState("medium_term");
  const [topTracksTimeFrame, setTopTracksTimeFrame] = useState("medium_term")
  const [topArtists, setTopArtists] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [playlists, setPlaylists] = useState([]);
  const { setAuthData, profile, accessToken  } = useAuth();
  const { getTopTracks, getTopArtists, getPlaylists } = useSpotifyApi();

  const getArtistImage = (artist: Record<string, any>) => artist.images[0].url;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const lastFmToken = params.get("token");

    if (code && !getStorage("used_code").value) {
      setStorage("used_code", code);
    }

    if (lastFmToken && !getStorage("usedLastFmToken").value) {
      const expiration = new Date().getTime() + 360000;
      setStorageWithExpiration("usedLastFmToken", lastFmToken, expiration);
    }
    if (!code) return
    access(code, setAuthData).then(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAndSetTopArtists = () =>
    getTopArtists(topArtistTimeFrame).then((x) => {
      setTopArtists(x.items);
    });
  
  const getAndSetTopTracks = () =>
    getTopTracks(topTracksTimeFrame).then((x) => {
      setTopTracks(x.items);
    });

  const getAndSetPlaylists = () =>
    getPlaylists().then((x) => {
      if (!x.items) return;
      setPlaylists(x.items);
    });

  useEffect(() => {
    if (!accessToken) return;
    getAndSetTopArtists()
    getAndSetTopTracks()
    getAndSetPlaylists()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    getAndSetTopTracks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topTracksTimeFrame])

  useEffect(() => {
    if (!accessToken) return;
    getAndSetTopArtists();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topArtistTimeFrame]);

  if (!profile) {
    return (
      <main className="p-4 w-full h-screen">
        <div className="flex flex-row gap-4 space-between items-center justify-center h-full w-full">
          <button
            className="btn"
            onClick={() => init(setAuthData)}
          >
            Init
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="p-4 w-full max-h-screen h-full overflow-y-hidden">
      <div className="flex gap-4 border border-white p-4 justify-between items-center h-[20vh] overflow-hidden">
        <div className="flex gap-4">
          {profile?.images?.[0].url && (
            <Image
              alt={profile?.display_name || ""}
              src={profile?.images?.[0].url || ""}
              height={100}
              width={100}
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
      <div className="flex gap-4  ">
        {topArtists?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/3 h-full overflow-y-scroll max-h-[70vh]">
            <div className="flex justify-between">
              <h3 className="text-lg">Top Artists</h3>
              <select
                onChange={(e) => {
                  setTopArtistTimeFrame(e.target.value);
                }}
              >
                <option value="short_term">short</option>
                <option value="medium_term">medium</option>
                <option value="long_term">long</option>
              </select>
            </div>
            <ul>
              {topArtists &&
                topArtists.map((artist: Record<string, any>, i) => {
                  return (
                    <li key={artist.id}>
                      <Link
                        href={`/artist/${artist.id}`}
                        className="flex flex-row gap-2 border border-white space-between mb-2 items-center pr-2 hover:bg-white hover:text-black cursor-pointer transition-all relative"
                      >
                        <div className="absolute px-1 py-0.5 bg-green-900 text-white text-xs top-0 left-0">
                          {i + 1}
                        </div>
                        <Image
                          src={getArtistImage(artist)}
                          className="h-20 w-20"
                          alt={artist.name}
                          width={80}
                          height={80}
                        />
                        {artist.name}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
        {topTracks?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/3 h-full overflow-y-scroll max-h-[70vh]">
            <div className="flex justify-between">
              <h3 className="text-lg">Top Songs</h3>
              <select
                onChange={(e) => {
                  setTopTracksTimeFrame(e.target.value);
                }}
                value={topTracksTimeFrame}
              >
                <option value="short_term">short</option>
                <option value="medium_term">medium</option>
                <option value="long_term">long</option>
              </select>
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
                      {song.name} - {artists}
                    </Link>
                  );
                })}
            </ul>
          </div>
        )}
        {playlists?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/3 h-full overflow-y-scroll max-h-[70vh]">
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
