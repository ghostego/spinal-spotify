import {
  sha256,
  base64encode,
  getAccessToken,
  generateRandomString,
} from "@/src/login";
import {
  setStorage,
  setStorageWithExpiration,
  removeFromStorage,
  getStorage
} from "../utils/localStorage";

const clientId: string = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const redirectUri: string = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

export const getProfile = async (code: string) => {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + code,
    },
  });
  return await response.json();
};

export const refreshAccessTokenFromStorage = async () => {
  // refresh token that has been previously stored
  const refreshToken = getStorage("refresh_token").value;
  if (!refreshToken) return {};
  const url = "https://accounts.spotify.com/api/token";

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  };
  const body = await fetch(url, payload);
  const response = await body.json();

  const expiration = new Date().getTime() + 360000;
  setStorageWithExpiration("accessToken", response.access_token, expiration)

  if (response.refresh_token) {
    setStorage("refresh_token", response.refresh_token)
  }
  return response.json();
};

export const access = async (code: string, setAuthData: (data: any) => void) => {
  const refresh_token = await refreshAccessTokenFromStorage();
  // code is coming from spotify setting the accessToken in response
  // if we don't have that code, that means we are accessing this page without authentication
  // if we have a refresh token, that means we have alreadyt been authenticated
  if (!code && refresh_token) {
    // if there is no access token on the refresh token end process
    if (!refresh_token.access_token) return;
    // we have the refresh token and the access token
    // get profile data
    getProfile(refresh_token.access_token).then((profile) => {
      setStorage("profile", profile)
      if (tokenData?.refresh_token) {
        setStorage("refresh_token", tokenData.refresh_token)
        setAuthData({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          profile: profile,
        });
      }
    });
    return;
  }
  // there was no refresh token and no code in the url, so we need to get the access token
  getAccessToken(clientId, code)
    .then((t) => {
      if (!t?.access_token || !t?.refresh_token) return false;
      // we have gotten the access token, now we need to get the profile
      setStorage("refresh_token", t.refresh_token)
      getProfile(t.access_token)
        .then((profile) => {
          if (profile.error) return console.log("Error Time: ", profile.error);
          // we have gotten the profile 
          setStorage("profile", profile)
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
  removeFromStorage("code_verifier");
  removeFromStorage("loglevel");
  removeFromStorage("used_code");
  window.location.pathname = "/"
};

export const logout = () => {
  removeFromStorage("profile");
  removeFromStorage("refresh_token");
  clearCache();
}

export const init = async (setAuthData: any) => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  // This is going to fire when we have a code in the url, which means we are hitting this only
  // when we have received our access code from spotify, then we remove it from the URL
  if (code && !getStorage("used_code").value) {
    setStorage("used_code", code)
    access(code, setAuthData);
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  // If we already have a profile, we exit initialization
  const existingProfile = getStorage("profile").value;
  if (existingProfile) {
    return;
  }

  //we check for a refresh token, which receive when we get our access token
  const refreshToken = getStorage("refresh_token").value;
  // if we have a refresh token, that means we have recently received an access token from spotify
  // and now can use the refresh token to regenerate the access token as needed
  if (refreshToken) {
    const data = await refreshAccessTokenFromStorage();
    if (data.access_token) {
      const profile = await getProfile(data.access_token);
      const expiration = new Date().getTime() + 360000;
      setStorage("profile", profile)
      setStorageWithExpiration("accessToken", data.access_token, expiration);
      return;
    }
  } 

  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);
  setStorage("code_verifier", codeVerifier);
  // we don't have any of the necessary data, so we need to request it from spotify
  authorizationRequest(codeChallenge)
};
