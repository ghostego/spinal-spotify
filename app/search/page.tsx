'use client'

import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useSpotifyApi } from "@/src/hooks/useSpotifyApi";
import ListItem from "../components/List/ListItem";


export default function Search () {
	const { accessToken } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [searchType, setSearchType] = useState<string[]>(["artist"])
	const [searchResults, setSearchResults] = useState<Record<string, any>>({});
  const { makeSearchRequest } = useSpotifyApi()!;

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e?.target?.value);

  const onTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypes: string[] = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );

    setSearchType(selectedTypes);
  };

	const onSearchSubmit = () => {
		if (!searchTerm || !searchType || !accessToken) return;
		makeSearchRequest(searchTerm, searchType.join(",")).then((results) => {
			setSearchResults(results);
		})
	}

  const getSmallestImage = (item: Record<string, any>) => {
    const { images } = item;
    if (!images) return;
    return images[images.length - 1];
  }

	return (
    <div className="p-4 flex flex-col gap-y-6 w-full">
      <div className="flex flex-row gap-4 border-b border-white pb-6">
        <input
          className="text-black p-2"
          value={searchTerm}
          onChange={(e) => onInputChange(e)}
          type="text"
        />
        <select
          className="text-black"
          onChange={(e) => onTypeChange(e)}
        >
          <option value="artist">Artist</option>
        </select>
        <button
          className="border border-white px-4 py-2"
          onClick={onSearchSubmit}
        >
          Submit Search
        </button>
      </div>
      <div>
        {Object.keys(searchResults).length > 0 && 
					<div className="flex flex-row gap-2 w-full">
						{searchType.map((type: string) => {
							const types = `${type}s`
							const items = searchResults[types]?.items ?? [];
							if (items.length === 0) return
							return (
                <div key={types} className="flex flex-col w-full">
                  <h2 className="text-lg font-bold mb-2">{types}</h2>
                  <ul className="flex flex-col gap-2 w-full">
                    {items.map((item: Record<string, any>) => {
                      const image = getSmallestImage(item);
                      const identifier = item.id || item.name;
                      const href = `/artist/${identifier}`;
                      return (
                        <ListItem
                          name={item.name}
                          href={href}
                          image={image}
                          key={item.name}
                        ></ListItem>
                      );})}
                  </ul>
                </div>
              );
						})}
					</div>
				}
      </div>
    </div>
  );
}