import { batchRequests } from "@/src/utils/batchRequests";
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi";

export const useSpotifyFeatures = () => {
	const { addSongsToPlaylist, createPlaylist } = useSpotifyApi()!;

	const createPlaylistAndAddSongs = async (
    songs: string[],
    name: string,
    description: string = ""
  ) => {
    const ADD_LIMIT = 100;

    try {
      const playlist = await createPlaylist(name, description);

      const songBatches: string[][] = [];
      for (let i = 0; i < songs.length; i += ADD_LIMIT) {
        songBatches.push(songs.slice(i, i + ADD_LIMIT));
      }

      const batchFns = songBatches.map((batch) => {
        return () => addSongsToPlaylist(batch, playlist.id);
      });

      const results = await batchRequests(batchFns);
      console.log("All songs added successfully", results);
    } catch (err) {
      console.error("Failed to create playlist or add songs", err);
    }
  };

	return {
		createPlaylistAndAddSongs
	}
};
