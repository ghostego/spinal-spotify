'use client'

import { useEffect, useState } from "react"
import { init, access } from "@/src/hooks/init";
import { useAuth } from "@/src/context/AuthContext"
import { setStorageWithExpiration, getStorage, setStorage } from "@/src/utils/localStorage";
import Image from "next/image";
import Link from "next/link";
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi"
import ListItem from "./components/List/ListItem";

const TIMEFRAMES = [
  {
    value: "short_term",
    label: "Short Term"
  },
  {
    value: "medium_term",
    label: "Medium Term",
  },
  {
    value: "long_term",
    label: "Long Term"
  }
]

export default function Home() {
  const [topArtistTimeFrame, setTopArtistTimeFrame] = useState("medium_term");
  const [topTracksTimeFrame, setTopTracksTimeFrame] = useState("medium_term")
  const [topArtists, setTopArtists] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [playlists, setPlaylists] = useState([]);
  const { setAuthData, profile, accessToken  } = useAuth();
  const { getTopTracks, getTopArtists, getPlaylists } = useSpotifyApi();

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
    if (!accessToken || !profile) return;
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
    <div className="p-4 pb-0 w-full max-h-screen h-full overflow-y-hidden flex flex-col space-between">
      <div className="flex gap-4 border border-white pr-4 justify-between items-center">
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
              <h3 className="text-lg">Top Artists</h3>
              <select
                onChange={(e) => {
                  setTopArtistTimeFrame(e.target.value);
                }}
                value={topArtistTimeFrame}
              >
                {TIMEFRAMES.map(timeframe => <option value={timeframe.value} key={timeframe.value}>{timeframe.label}</option>)}
              </select>
            </div>
            <ul>
              {topArtists &&
                topArtists.map((artist: Record<string, any>) => {
                  return (
                    <ListItem
                      key={artist.id}
                      href={`/artist/${artist.id}`}
                      name={artist.name}
                      image={artist.images[0]}
                    ></ListItem>
                  );
                })}
            </ul>
          </div>
        )}
        {topTracks?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/3 h-full overflow-y-scroll max-h-[70vh] pb-4">
            <div className="flex justify-between">
              <h3 className="text-lg">Top Songs</h3>
              <select
                onChange={(e) => setTopTracksTimeFrame(e.target.value)}
                value={topTracksTimeFrame}
              >
                {TIMEFRAMES.map(timeframe => <option value={timeframe.value} key={timeframe.value}>{timeframe.label}</option>)}
              </select>
            </div>
            <ul>
              {topTracks &&
                topTracks?.map((song: Record<string, any>, i) => {
                  const artists = song.artists
                    .map((artist: Record<string, any>) => artist.name)
                    .join(",");
                  return (
                    <ListItem
                      href={song.external_urls.spotify}
                      name={`${song.name} - ${artists}`}
                      key={song.id}
                    />
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
                    <ListItem
                      key={playlist.id}
                      href={`/playlist/${playlist.id}/edit`}
                      name={playlist.name}
                    />
                  );
                })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

}
