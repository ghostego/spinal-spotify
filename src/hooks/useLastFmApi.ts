import { buildLastFmUrl } from "../utils/url";

const api_key = process.env.NEXT_PUBLIC_LASTFM_API_KEY || "";

export const getArtistEndpointOptions = (handle: string, method: string) => {
  return {
    method: `artist.${method}`,
    artist: handle,
    api_key: api_key,
    format: "json",
  };
}

export const getSimilarArtists = async (handle: string) => {
  const url = buildLastFmUrl("",getArtistEndpointOptions(handle, "getsimilar"));
	return await fetch(url.toString());
}

export const getArtistData = async (handle: string) => {
  const url = buildLastFmUrl("", getArtistEndpointOptions(handle, "getinfo"));
  return await fetch(url.toString());
}

export const request = () => {
  const url = new URL("http://www.last.fm/api/auth/");
  url.searchParams.set("api_key", api_key);
  window.location.href = url.toString();
};