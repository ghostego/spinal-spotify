

const client_secret = process.env.NEXT_PUBLIC_LASTFM_CLIENT_SECRET || "";
const api_key = process.env.NEXT_PUBLIC_LASTFM_API_KEY || "";

export const getSimilarArtists = async (handle: string) => {
	const API_URL = "http://ws.audioscrobbler.com/2.0/";
	const requestUrl = new URL(API_URL);
	requestUrl.searchParams.set("method", "artist.getsimilar")
	requestUrl.searchParams.set("artist", handle);
	requestUrl.searchParams.set("api_key", api_key);
	requestUrl.searchParams.set("format", "json");
	return await fetch(requestUrl.toString());
}

export const request = () => {
  const url = new URL("http://www.last.fm/api/auth/");
  url.searchParams.set("api_key", api_key);
  window.location.href = url.toString();
};