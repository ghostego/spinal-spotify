export const fetcher = async (url: string, options:{headers?:{}, method?: string, body?: string}, accessToken: string) => {
	if (!accessToken) return;
	const mergedOptions: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };
 	const response = await fetch(url, mergedOptions);
	if (!response.ok) {
		throw new Error('there was an error');
	}
	return response?.json() || response;
}