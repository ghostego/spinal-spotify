import { fetcher } from "../utils/fetcher";

export const makeSearchRequest = async (query: string, type: string, accessToken: string) => {
  const url = new URL(
    `https://api.spotify.com/v1/search?q=${query}&type=${type}`
  );

  const response = await fetcher(url.toString(), {}, accessToken);
  return response;
};