export const buildSpotifyUrl = (path: string, params?: Record<string, string>) => {
  const url = new URL(`https://api.spotify.com/v1/${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value)
    );
  }
  return url.toString();
};

export const buildLastFmUrl = (path: string = "", params?: Record<string, string>) => {
  const url = new URL(`http://ws.audioscrobbler.com/2.0/${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => 
      url.searchParams.set(key, value)
    )
  }
  return url.toString();
}