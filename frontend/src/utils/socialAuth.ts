declare global {
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
}

interface ImportMetaEnv {
  VITE_GOOGLE_CLIENT_ID: string;
  VITE_FACEBOOK_APP_ID: string;
}

export const loadGoogleSDK = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('auth2', () => {
        window.gapi.auth2
          .init({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          })
          .then(() => {
            resolve();
          })
          .catch((error: Error) => {
            reject(error);
          });
      });
    };
    script.onerror = (error) => {
      reject(error);
    };
    document.head.appendChild(script);
  });
};

export const loadFacebookSDK = () => {
  return new Promise<void>((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v12.0',
      });
      resolve();
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      reject(error);
    };
    document.head.appendChild(script);
  });
}; 