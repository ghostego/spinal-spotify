'use client'

import { useEffect, useState, useCallback } from "react"
import { init, access } from "@/src/hooks/init"
import { useAuth } from "@/src/context/AuthContext"
import { request as LastFMRequest } from "@/src/hooks/useLastFmApi"
import { setStorageWithExpiration } from "@/src/utils/localStorage"
import Image from "next/image";
import Link from "next/link";
import { getTopItems } from "@/src/hooks/init";

export default function Home() {
  const { setAuthData, profile, accessToken  } = useAuth()
  const [topArtists, setTopArtists] = useState([]);
  const [timeFrame, setTimeFrame] = useState("medium_term");
  const [topSongs, setTopSongs] = useState([]);

  const getTopArtists = useCallback(() => {
    if (!accessToken) return;
    getTopItems("artists", timeFrame, accessToken).then((data) => {
      setTopArtists(data.items);
    });
  }, [accessToken, timeFrame]);

  const getTopSongs = useCallback(() => {
    if (!accessToken) return;
    getTopItems("tracks", timeFrame, accessToken).then((data) => {
      setTopSongs(data.items);
    });
  }, [accessToken, timeFrame]);

  const getArtistImage = (artist: Record<string, any>) => artist.images[0].url;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const lastFmToken = params.get("token");

    if (code && !window.localStorage.getItem("used_code")) {
      window.localStorage.setItem("used_code", code);
    }

    if (lastFmToken && !localStorage.getItem("usedLastFmToken")) {
      const expiration = new Date().getTime() +  3600000;
      setStorageWithExpiration("usedLastFmToken", lastFmToken, expiration);
    }
    if (!code) return
    access(code, setAuthData).then(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    getTopArtists();
    getTopSongs();
  }, [accessToken, getTopArtists, getTopSongs]);

  if (!profile) {
    return (
      <main className="p-4 w-full h-screen">
        <div className="flex flex-row gap-4 space-between items-center justify-center h-full">
          <button
            className="border border-red-900 color-red-900 px-5 py-4"
            onClick={() => init(setAuthData)}
          >
            Init
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg mb-4">Profile</h3>
      <div className="flex gap-2">
        <Image
          alt={profile.display_name}
          src={profile?.images?.[0].url}
          height={200}
          width={200}
        />
        <div className="flex flex-col">
          <h2 className="text-xl">{profile?.display_name}</h2>
          <h4 className="text-md">{profile?.followers?.total} followers</h4>
          <h4 className="text-md">{profile?.email}</h4>
          <h4 className="text-md">{profile?.id}</h4>
        </div>
      </div>
      <div className="flex gap-4">
        {topArtists?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/2">
            <h3 className="text-lg">Top Artists</h3>
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
        {topSongs?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 w-1/2">
            <h3 className="text-lg">Top Songs</h3>
            <ul>
              {topSongs &&
                topSongs?.map((song: Record<string, any>, i) => {
                  const artists = song.artists
                    .map((artist: Record<string, any>) => artist.name)
                    .join(",");
                  return (
                    <li
                      key={song.id}
                      className="flex flex-row gap-2 border border-white space-between mb-2 items-center pr-2 hover:bg-white hover:text-black cursor-default transition-all relative p-4 h-[82px]"
                    >
                      <div className="absolute px-1 py-0.5 bg-green-900 text-white text-xs top-0 left-0">
                        {i + 1}
                      </div>
                      {song.name} - {artists}
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

}
