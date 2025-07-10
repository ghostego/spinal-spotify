import { useAuth } from "@/src/context/AuthContext"
import { fetcher } from "@/src/utils/fetcher";
import { batchRequests } from "@/src/utils/batchRequests";

export const useSpotifyApi = () => {
  const { accessToken, profile } = useAuth();

  ///////////////////
  // PLAYLIST DATA //
  ///////////////////

  const getPlaylists = async (offset: number = 0) => {
    const url = new URL("https://api.spotify.com/v1/me/playlists");
    if (offset != 0) url.searchParams.set("offset", offset.toString());
    url.searchParams.set("limit", "10");
    const response = await fetcher(url.toString(), {}, accessToken!);
    return response;
  };

  const getPlaylist = async (id: string) => {
    const url = new URL(`https://api.spotify.com/v1/playlists/${id}`);
    const response = await fetcher(url.toString(), {}, accessToken!);
    return response;
  };

  const getPlaylistTracks = async (id: string, offset: number = 0) => {
    const url = new URL(`https://api.spotify.com/v1/playlists/${id}/tracks`);
    if (offset !== 0) url.searchParams.set("offset", offset.toString());
    const response = await fetcher(url.toString(), {}, accessToken!);
    return response;
  };

  const addSongsToPlaylist = async (
    songs: string[],
    playlist_id: string,
  ) => {
    const url = new URL(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`);
    const response = await fetcher(url.toString(),
      {
        method: "POST",
        body: JSON.stringify({
          uris: songs.filter((song) => song),
        }),
      },
      accessToken!
    );

    if (!response.ok) {
      throw new Error("there was an error", response);
    }

    return await response.json();
  };

  const createPlaylist = async (
    songs: string[],
    name: string,
    description: string = ""
  ) => {
    const ADD_LIMIT = 100;
    const profileJSON = typeof profile === "string" ? JSON.parse(profile) : profile
    const userId = profileJSON.id;
    
    // 1. Create the playlist
    const response = await fetcher(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          public: false,
          description,
        }),
      }, accessToken!
    );

    if (!response.ok) {
      console.error("Failed to create playlist");
      return;
    }

    const playlist = await response.json();

    // 2. Split songs into batches of ADD_LIMIT
    const songBatches: string[][] = [];
    for (let i = 0; i < songs.length; i += ADD_LIMIT) {
      songBatches.push(songs.slice(i, i + ADD_LIMIT));
    }

    // 3. Create request functions for each batch
    const batchFns = songBatches.map((batch) => {
      return () => addSongsToPlaylist(batch, playlist.id);
    });

    try {
      const results = await batchRequests(batchFns);
      console.log("All songs added successfully", results);
    } catch (err) {
      console.error("Failed to add songs to playlist", err);
    }
  };

  const unfollowPlaylist = async (playlistId: string) => {
    const text = "Do you want to unfollow this playlist?";
    const url = new URL(
      `https://api.spotify.com/v1/playlists/${playlistId}/followers`
    );
    if (confirm(text)) {
      const response = await fetcher(url.toString(), { method: "DELETE" }, accessToken!);
      if (response.ok) window.location.pathname = "/playlist";
    }
  }

  /////////////////
  // ARTIST DATA //
  /////////////////

  const getArtist = async (id: string) => {
    const url = `https://api.spotify.com/v1/artists/${id}`;
    const response = await fetcher(url.toString(), {}, accessToken!);
    return response;
  };

	const getArtistTopTracks = async (id: string) => {
		const url = `https://api.spotify.com/v1/artists/${id}/top-tracks`;
    const response = await fetcher(url.toString(), {}, accessToken!);
    return response;
	};
	
  return {
    addSongsToPlaylist,
    createPlaylist,
    getPlaylists,
    getPlaylist,
    getPlaylistTracks,
    unfollowPlaylist,
    getArtist,
    getArtistTopTracks,
  };
}