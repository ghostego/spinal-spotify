'use client'

import { useEffect, useState } from "react"
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi";
import { useAuth } from "@/src/context/AuthContext";
import Link from "next/link";

export default function Playlist () {
  const { accessToken } = useAuth();
	const { getPlaylists, unfollowPlaylist } = useSpotifyApi()!;
	const [ playlists, setPlaylists ] = useState<Record<string, any>>([]);

	useEffect(() => {
		if (!accessToken) return;
		getPlaylists(0).then((data) => {
			setPlaylists(data.items)
			getAllPlaylists(data);
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accessToken]);

	const getAllPlaylists = async (currentPlaylistData: Record<string, any>) => {
    if (!playlists || !accessToken) return;

    const { items = [], total = 0, limit = 10 } = currentPlaylistData;

    const pageCount = Math.ceil(total / limit);

    // Already fetched the first page, so start from page 1
    const requests = Array.from({ length: pageCount - 1 }, (_, i) => {
      const offset = (i + 1) * limit;
      return getPlaylists(offset);
    });

    try {
      const responses = await Promise.all(requests);
      const additionalItems = responses.flatMap((res) => res.items ?? []);
      setPlaylists([...items, ...additionalItems]);
    } catch (err) {
      console.error("Error fetching additional playlists:", err);
    }
  };

	return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-lg mb-4">Playlists</h3>
      </div>
      <ul className="flex flex-col gap-2 justify-items-stretch mt-6">
        {playlists &&
          playlists.map((playlist: Record<string, any>) => {
            return (
              <li
                key={playlist.id}
                className="border border-white flex w-full justify-between items-center p-2"
              >
                <div>{playlist.name}</div>
                <div className="flex flex-col gap-1">
                  <Link href={`/playlist/${playlist.id}/edit`} className="btn">
                    Edit Playlist
                  </Link>
                  <button
                    className="btn btn-error btn-outline"
                    onClick={() => unfollowPlaylist(playlist.id)}
                  >
                    Unfollow Playlist
                  </button>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}