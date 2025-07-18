"use client";

import { useState } from "react";
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi";
import { useAuth } from "@/src/context/AuthContext";
import SearchResult from "@/components/search/SearchResult";
import SearchResultInfo from "@/components/search/SearchResultInfo"
import SlideOutSidebar from "@/components/SlideOutSidebar";
import Image from "next/image"

export default function NewPlaylist() {
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<string[]>(["artist"]);
  const [searchResults, setSearchResults] = useState<Record<string, any>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [selectedResult, setSelectedResult] = useState({});
	const [isResultInfoOpen, setIsResultInfoOpen] = useState(false)
  const { makeSearchRequest } = useSpotifyApi()!;
  const { accessToken } = useAuth();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const onTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypes = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setSearchType(selectedTypes);
  };

  const onSearchSubmit = (e: React.ChangeEvent) => {
		e.preventDefault();
    if (!searchTerm || !searchType || !accessToken) return;
    makeSearchRequest(searchTerm, searchType.join(",")).then((results) => {
      setSearchResults(results);
    });
  };

  const getSmallestImage = (item: Record<string, any>) => {
    const { images } = item;
    return images?.[images.length - 1];
  };

	const updateAndShowResultInfo = (result: Record<string, any>) => {
		setSelectedResult(result)
		setIsResultInfoOpen(true);
	}

	const resultHeader = (result: Record<string, any>) => {
		if (!result.images) return <div></div>
		return (
        <div className="flex items-center gap-x-2">
          <Image
            src={result.images[0].url}
            alt={result.name}
            height={100}
            width={100}
          />
          {result.name}
        </div>
    );
	}

  return (
    <div className="relative w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <input placeholder="Playlist Name" type="text" className="p-2" />
          <input placeholder="description" type="textarea" className="p-2" />
        </div>
        {/* Open sidebar button */}
        <div className="flex flex-col gap-y-1">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="hover:bg-black hover:text-red-500 transition-all btn"
          >
            Add Songs
          </button>
          <button className="btn btn-primary">Create Playlist</button>
        </div>
      </div>
      <div className="w-full flex flex-col mt-2 gap-y-1">
        {playlistSongs.length > 0 &&
          playlistSongs.map((song: Record<string, any>) => {
            return (
              <div
                key={song.id}
                className="flex items-center gap-x-2 border border-white justify-between p-4"
              >
                <div className="flex gap-x-2 items-center">
                  {song.name} -{" "}
                  {song.artists.map((artist:Record<string, any>) => artist.name).join(", ")}
                </div>
                <button className="btn btn-error btn-outline">Remove</button>
              </div>
            );
          })}
      </div>
      <SlideOutSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setSearchResults([]);
          setSearchTerm("");
        }}
        header={
          <div className="p-4 w-full flex flex-row gap-4">
            <form
              onSubmit={(e) => onSearchSubmit(e)}
              className="flex w-full border border-white"
            >
              <input
                className="text-white p-2 flex-1 "
                value={searchTerm}
                onChange={onInputChange}
                placeholder="Search for an artist..."
                type="text"
              />
              <select
                className="text-black border-l border-white px-4 text-white"
                onChange={onTypeChange}
              >
                <option value="artist">Artist</option>
                {/* <option value="track">Track</option> */}
              </select>
              <button
                className="border-l border-white px-4 py-2 hover:bg-white hover:text-black transition-all"
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
        }
      >
        {/* Search Results */}
        <div className="p-4 overflow-y-auto h-[calc(100%-100px)]">
          {Object.keys(searchResults).length > 0 && (
            <div className="flex flex-col gap-8">
              {searchType.map((type) => {
                const types = `${type}s`;
                const items = searchResults[types]?.items ?? [];
                if (items.length === 0) return null;

                return (
                  <div key={types}>
                    <h2 className="text-lg font-bold mb-2 capitalize">
                      {types}
                    </h2>
                    <ul className="flex flex-col gap-2">
                      {items.map((item: Record<string, any>) => (
                        <SearchResult
                          key={item.id}
                          item={item}
                          image={getSmallestImage(item)}
                          onClick={() => updateAndShowResultInfo(item)}
                        />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          <SlideOutSidebar
            isOpen={isResultInfoOpen}
            onClose={() => {
              setIsResultInfoOpen(false);
              setSelectedResult({});
            }}
            header={resultHeader(selectedResult)}
          >
            <SearchResultInfo
              result={selectedResult}
              playlistSongs={playlistSongs}
              setPlaylistSongs={setPlaylistSongs}
            />
          </SlideOutSidebar>
        </div>
      </SlideOutSidebar>
    </div>
  );
}
