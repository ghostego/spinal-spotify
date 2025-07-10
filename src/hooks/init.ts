import {
  sha256,
  base64encode,
  getAccessToken,
  generateRandomString,
} from "@/src/login";

const clientId: string = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
const clientSecret: string = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || "";
const redirectUri: string = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "";

export const getProfile = async (code: string) => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + code,
    },
  });
  return await response.json();
};

export const getTopItems = async (type: string, timeFrame: string, accessToken: string) => {
  const url = new URL(`https://api.spotify.com/v1/me/top/${type}`);
  url.searchParams.set("limit", "50")
  url.searchParams.set("time_range", timeFrame)
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
  return await response.json();
};

export const refreshAccessToken = async (refreshToken: string) => {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const data = await response.json();
  return data;
};

export const access = async (code: string, setAuthData: (data: any) => void) => {
  const refresh_token = window.localStorage.getItem("refresh_token") || "";
  if (!code && refresh_token) {
    const tokenData = await refreshAccessToken(refresh_token);
    if (!tokenData.access_token) {
      return;
    }
    getProfile(tokenData.access_token).then((profile) => {
      window.localStorage.setItem("profile", JSON.stringify(profile));
      if (tokenData.refresh_token) {
        window.localStorage.setItem("refresh_token", tokenData.refresh_token);
        setAuthData({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          profile: profile
        })
      }
    });
    return;
  }
  getAccessToken(clientId, code)
    .then((t) => {
      if (!t?.access_token || !t?.refresh_token) return false;
      getProfile(t.access_token)
        .then((profile) => {
          if (profile.error) return console.log("Error Time: ", profile.error);
          window.localStorage.setItem("refresh_token", t.refresh_token);
          window.localStorage.setItem("profile", JSON.stringify(profile));        
          setAuthData({
            accessToken: t.access_token,
            refreshToken: t.refresh_token,
            profile: profile,
          });
          return profile
        })
        .catch((y) => {
          console.log("Error Time: ", y);
        });
    })
    .catch((y) => {
      console.log("Error Time: ", y);
    });
    return;
};
const authorizationRequest = async (codeChallenge: string) => {
  const scope =
    "user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private playlist-read-private";
  const authUrl: URL = new URL("https://accounts.spotify.com/authorize");
  // generated in the previous step
  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }).toString();
  window.location.href = authUrl.toString();
};


export const clearCache = () => {
  window.location.search = "";
  window.localStorage.removeItem("code_verifier");
  window.localStorage.removeItem("profile");
  window.localStorage.removeItem("loglevel");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("used_code");
  window.location.pathname = "/"
};

export const init = async (setAuthData: any) => {
  clearCache()
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  // This is going to fire when we have a code in the url, which means we are hitting this only
  // when we have received our access code from spotify, then we remove it from the URL
  if (code && !window.localStorage.getItem("used_code")) {
    window.localStorage.setItem("used_code", code);
    access(code, setAuthData);
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  // If we already have a profile, we exit initialization
  const existingProfile = window.localStorage.getItem("profile");
  if (existingProfile) {
    return;
  }

  //we check for a refresh token, which receive when we get our access token
  const refreshToken = window.localStorage.getItem("refresh_token");
  // if we have a refresh token, that means we have recently received an access token from spotify
  // and now can use the refresh token to regenerate the access token as needed
  if (refreshToken) {
    const data = await refreshAccessToken(refreshToken);
    if (data.access_token) {
      const profile = await getProfile(data.access_token);
      window.localStorage.setItem("profile", JSON.stringify(profile));
      window.localStorage.setItem("accessToken", data.access_token);
    }
    return;
  } 

  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);
  window.localStorage.setItem("code_verifier", codeVerifier);
  // we don't have any of the necessary data, so we need to request it from spotify
  authorizationRequest(codeChallenge)
};
