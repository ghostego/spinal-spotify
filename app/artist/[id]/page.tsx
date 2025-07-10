'use client'

import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import { getSimilarArtists } from "@/src/hooks/useLastFmApi";
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi";
import { getRandomResults } from "@/src/utils/getRandom";
import { handleize } from "@/src/utils/handleize";
import { batchRequests } from "@/src/utils/batchRequests";
import Image from "next/image";

export default function ArtistInfo () {
	const { accessToken } = useAuth();
	const [artistData, setArtistData] = useState<Record<string, any>>({});
	const [similarArtists, setSimilarArtists] = useState([]);
	const [topTracks, setTopTracks] = useState([])
	const { getArtist, getArtistTopTracks, createPlaylist, makeSearchRequest } =
    useSpotifyApi();

	useEffect(() => {
		const id = window.location.pathname.split("artist/")[1];
    if (!accessToken || !id) return;
    if (Object.keys(artistData).length > 0) return;
    getArtist(id).then((data) => {
      setArtistData(data);
      getArtistTopTracks(data.id).then((trackData) => {
        setTopTracks(trackData.tracks)
        getSimilarArtistsByHandle(handleize(data?.name));
      })
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const getSimilarArtistsByHandle = (handle: string) => {
    getSimilarArtists(handle)
      .then((data) => data.json())
      .then((data) => {
        if (data?.error) throw new Error(data.message);
        setSimilarArtists(data.similarartists.artist);
      })
      .catch((err) => {
        console.log(err);
      });
  }

	const makeSimilarPlaylist = async () => {
    const MAX_SEARCH = 10;
    const randomResults = getRandomResults(
      Object.values(similarArtists),
      MAX_SEARCH
    );
    if (!accessToken) return;
    const requestedArtistsData: Record<string, any> = {};

    const searchRequests = randomResults.map((result) => {
      requestedArtistsData[result.name] = result;
      return () => makeSearchRequest(result.name, "artist");
    });

    // Throttle search requests
    const searchResponses = await batchRequests(searchRequests, 5);

    searchResponses.forEach((res) => {
      res.artists.items.forEach((item: Record<string, any>) => {
        const artistName = item.name;
        if (!requestedArtistsData[artistName]) return;
        requestedArtistsData[artistName] = {
          ...requestedArtistsData[artistName],
          spotify: item,
        };
      });
    });

    const topTrackRequests = Object.values(requestedArtistsData)
      .filter((a) => a.spotify?.id)
      .map((a) => {
        return () => getArtistTopTracks(a.spotify.id)
      });

    // Throttle top track requests
    const topTracksResults = await batchRequests(topTrackRequests, 5);

    const songUris = topTracksResults
      .flatMap((t) => t.tracks)
      .map((track) => track.uri);

    const uniqueUris = [...new Set(getRandomResults(songUris, 100))].map((uri) => uri.value);

    await createPlaylist(
      uniqueUris,
      `${artistData?.name} Similar Artists ${Date.now()}`,
      "This is a new playlist!"
    );
  };

  if (!artistData || Object.keys(artistData).length == 0) return <div>Loading...</div>
	
	return (
    <div className="p-4 w-full">
      {Object.keys(artistData).length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-x-2 items-center border border-white p-4 relative">
            <Image
              alt={artistData.name}
              src={artistData.images?.[0].url}
              height={100}
              width={100}
            />
            <div className="flex flex-col gap-y-1">
              <h3 className="text-lg">{artistData?.name}</h3>
              <p className="text-sm">{artistData.followers?.total} followers</p>
              <p className="text-xs">{artistData?.genres?.join(", ")}</p>
            </div>
            <div className="absolute top-0 right-0 p-1 text-black bg-white">
              {artistData.popularity}
            </div>
          </div>
          <div className="flex flex-row w-full">
            <div className="flex flex-col w-1/2 p-2">
              <h3 className="text-lg mb-2">Top Songs</h3>
              {topTracks &&
                topTracks.length > 0 &&
                topTracks.map((track: Record<string, any>) => {
                  return (
                    <div key={track.id} className="flex text-xs mb-1">
                      {track.name} - {track.album.name}
                    </div>
                  );
                })}
            </div>
            {similarArtists?.length > 0 && (
              <div className="flex w-1/2 flex-col">
                <div className="flex flex-col p-4 border border-white gap-2 w-1/2 w-full mb-2">
                  <h3 className="text-lg">Related Artists: </h3>
                  <div className="overflow-y-scroll h-[200px] flex flex-wrap gap-1">
                    {similarArtists.map((artist: Record<string,any>, i) => {
                      return (
                        <div
                          key={"similar-artist-" + i}
                          className="text-xs mb-1 px-1 py-0.5 border border-white flex hover:bg-white hover:text-black cursor-default transition-bg-color"
                        >
                          {artist.name}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => makeSimilarPlaylist()}
                    className="border border-white px-2 py-1"
                  >
                    Make Related Playlist
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}