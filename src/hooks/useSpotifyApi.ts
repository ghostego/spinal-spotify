import { useAuth } from "@/src/context/AuthContext"
import { fetcher } from "@/src/utils/fetcher";
import { buildSpotifyUrl } from "../utils/url";

export const useSpotifyApi = () => {
  const { accessToken, profile } = useAuth();
  
  const createMissingTokenHandler = (methodName: string) => {
    return async () => {
      throw new Error(`Missing access token: ${methodName} cannot be called`);
    };
  };

  const methods = [
    "addSongsToPlaylist", "createPlaylist", "getPlaylists", "getPlaylist", "getPlaylistTracks", "unFollowPlaylist",
    "getArtist", "getArtistsTopTracks", "makeSearchRequest", "getProfile", "getTopArtists", "getTopTracks", "getUserProfile",
    "getUserPlaylists", "getArtistAlbums", "getAlbum"
  ] 

  if (!accessToken) {
    const handlers = methods.reduce((acc, method) => {
      acc[method] = createMissingTokenHandler(method);
      return acc;
    }, {} as Record<string, () => Promise<never>>);
    return handlers;
  }

  const spotifyFetcher = async(path: string, options: {} = {}) => {
    if (!accessToken) throw new Error("Missings access token");
    const url = buildSpotifyUrl(path, options);
    return fetcher(url, options, accessToken)
  }

  ///////////////////
  // PLAYLIST DATA //
  ///////////////////

  const getPlaylists = async (offset: number = 0) => spotifyFetcher("me/playlists", {
      offset: offset.toString(),
      limit: "10",
    });

  const getPlaylist = async (id: string) => spotifyFetcher(`playlists/${id}`);

  const getPlaylistTracks = async (id: string, offset: number = 0) => spotifyFetcher(`playlists/${id}/tracks`, {
      offset: offset.toString()
    });

  const addSongsToPlaylist = async (
    songs: string[],
    playlist_id: string,
  ) => spotifyFetcher(`playlists/${playlist_id}/tracks`, {
      method: "POST",
      body: JSON.stringify({
        uris: songs.filter((song) => song),
      }),
    });

  const createPlaylist = async (
    name: string,
    description: string = ""
  ) => {
    const profileJSON = typeof profile === "string" ? JSON.parse(profile) : profile
    const userId = profileJSON.id;

    return spotifyFetcher(`users/${userId}/playlists`, {
      method: "POST",
      body: JSON.stringify({
        name,
        public: false,
        description,
      })
    });
  };

  const unfollowPlaylist = async (playlistId: string) => {
    const text = "Do you want to unfollow this playlist?";
    
    if (confirm(text)) {
      spotifyFetcher(`playlists/${playlistId}/followers`, { method: "DELETE" }).then((response) => {
        if (response.ok) window.location.pathname = "/playlist";
      })
    }
  }

  /////////////////
  // ARTIST DATA //
  /////////////////

  const getArtist = async (id: string) => spotifyFetcher(`artists/${id}`)

	const getArtistTopTracks = async (id: string) => spotifyFetcher(`artists/${id}/top-tracks`);

  const getArtistAlbums = async (id: string) => spotifyFetcher(`artists/${id}/albums`);

  const getAlbum = async (id: string) => spotifyFetcher(`albums/${id}`)

  ////////////////////
  // SEARCH REQUEST //
  ////////////////////

  const makeSearchRequest = async (
    query: string,
    type: string,
  ) => spotifyFetcher(`search?q=${query}&type=${type}`);

	/////////////////////
  // PROFILE REQUEST //
  /////////////////////

  const getProfile = async () => spotifyFetcher("me");

  const getUserProfile = async (id: string) => spotifyFetcher(`users/${id}`);

  const getUserPlaylists = async (id: string) => spotifyFetcher(`users/${id}/playlists`);

  const getTopItems = async (type: string, timeFrame: string, limit: number = 10) => {
    return spotifyFetcher(`me/top/${type}`, { limit: limit.toString(), time_range: timeFrame });
  };

  const getTopArtists = async (timeFrame: string, limit: number = 10) => getTopItems("artists", timeFrame, limit)

  const getTopTracks = async (timeFrame: string, limit: number = 10) => getTopItems("tracks", timeFrame, limit)

  return {
    addSongsToPlaylist,
    createPlaylist,
    getPlaylists,
    getPlaylist,
    getPlaylistTracks,
    unfollowPlaylist,
    getArtist,
    getArtistTopTracks,
    makeSearchRequest,
    getProfile,
    getTopArtists,
    getTopTracks,
    getUserProfile,
    getUserPlaylists,
    getArtistAlbums,
    getAlbum,
  };
}