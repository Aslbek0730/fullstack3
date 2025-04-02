interface ImportMetaEnv {
  VITE_GOOGLE_CLIENT_ID: string;
  VITE_FACEBOOK_APP_ID: string;
}

interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    auth2: {
      init: (config: { client_id: string }) => Promise<void>;
      getAuthInstance: () => Promise<{
        signIn: () => Promise<{
          getAuthResponse: () => { id_token: string };
        }>;
      }>;
    };
  };
  FB: {
    init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
    login: (callback: (response: { authResponse?: { accessToken: string } }) => void) => void;
  };
  fbAsyncInit: () => void;
} 