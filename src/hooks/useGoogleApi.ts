// src/hooks/useGoogleApi.js
import { useState, useEffect } from 'react';
import { TokenClient, GapiClient, GisError } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // GAPI also needs an API key for discovery
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCOVERY_DOC_URL = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'; // Added readonly for potential future use

function useGoogleApi() {
    const [isGapiLoaded, setIsGapiLoaded] = useState(false);
    const [isGisLoaded, setIsGisLoaded] = useState(false);
    const [gapiClient, setGapiClient] = useState<GapiClient | null>(null);
    const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Overall loading state
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const gapiUrl = 'https://apis.google.com/js/api.js';
        const gisUrl = 'https://accounts.google.com/gsi/client';

        let gapiScript, gisScript;

        // Load GAPI
        gapiScript = document.createElement('script');
        gapiScript.src = gapiUrl;
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = () => {
            console.log('GAPI script loaded.');
            window.gapi.load('client', initializeGapiClient); // Load the client library
        };
        gapiScript.onerror = () => setError('Failed to load GAPI script.');
        document.body.appendChild(gapiScript);

        // Load GIS
        gisScript = document.createElement('script');
        gisScript.src = gisUrl;
        gisScript.async = true;
        gisScript.defer = true;
        gisScript.onload = () => {
            console.log('GIS script loaded.');
            initializeGisClient();
        };
        gisScript.onerror = () => setError('Failed to load GIS script.');
        document.body.appendChild(gisScript);

        // Initialize GAPI client
        async function initializeGapiClient() {
            try {
                console.log("Fetching Calendar API discovery document...");
                // Manually fetch the discovery document
                const calendarApiDiscovery = await fetch(DISCOVERY_DOC_URL) // DISCOVERY_DOC defined earlier
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch discovery doc: ${response.status} ${response.statusText}`);
                        }
                        return response.json();
                    });
                console.log("Discovery document fetched successfully.");

                await window.gapi.client.init({
                    apiKey: API_KEY, // Still needed for subsequent API calls
                    discoveryDocs: [calendarApiDiscovery], // Pass the fetched JSON object
                });
                console.log('GAPI client initialized with fetched discovery doc.');
                setGapiClient(window.gapi.client);
                setIsGapiLoaded(true);
                checkLoadingComplete();
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error('Error initializing GAPI client:', message);
                setError(`GAPI Init Failed: ${message}`);
                setIsLoading(false);
            }
        }

        // Initialize GIS client
        function initializeGisClient(): void { // Added explicit void return type
            try {
                if (!window.google?.accounts?.oauth2) {
                    console.warn("GIS library not fully loaded before initialization.");
                    setError("Google Sign-In library not fully loaded. Please wait.");
                    return; // Exit if GIS not available
                }

                const client: TokenClient = window.google.accounts.oauth2.initTokenClient({ // Correctly typed
                    client_id: CLIENT_ID, // string
                    scope: SCOPES,    // string
                    callback: (tokenResponse: any) => { // Type the tokenResponse (any or a more specific GIS type if available)
                        console.log('GIS Token Client Callback:', tokenResponse);

                        if (tokenResponse && tokenResponse.access_token) {
                            console.log('Authentication successful.');
                            setIsSignedIn(true);
                            checkLoadingComplete();
                        } else {
                            console.error('Authentication failed:', tokenResponse);
                            setError('Authentication failed or access denied.');
                            setIsSignedIn(false);
                        }
                    },
                    error_callback: (err: GisError) => { // Type the error object
                        console.error('GIS Token Client Error:', err);

                        if (err.type !== 'popup_closed_by_user') {
                            setError(`Authentication error: ${err.type || 'Unknown error'}`);
                        }
                        setIsSignedIn(false);
                    }
                });
                console.log('GIS Token Client initialized.');
                setTokenClient(client);
                setIsGisLoaded(true);
                checkLoadingComplete();
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err); // Safely get the error message
                console.error('Error initializing GIS client:', message);
                setError(`Failed to initialize Google Sign-In: ${message}`);
            }
        }

        // Check if both scripts are loaded and initialized
        function checkLoadingComplete() {
            // Update loading state only when both flags are true or an error occurred
            // This check happens within each onload/init callback
            if ((isGapiLoaded && isGisLoaded) || error) {
                setIsLoading(false);
                console.log(`Loading complete. GAPI: ${isGapiLoaded}, GIS: ${isGisLoaded}, Error: ${error}`);
            }
        }


        // Cleanup function to remove scripts if the component unmounts
        return () => {
            if (gapiScript && gapiScript.parentNode) {
                gapiScript.parentNode.removeChild(gapiScript);
            }
            if (gisScript && gisScript.parentNode) {
                gisScript.parentNode.removeChild(gisScript);
            }
            // Optional: Reset GAPI/GIS state if needed globally, though usually not necessary
            // window.gapi = null;
            // window.google = null;
        };
        // Rerun effect if critical config changes, though usually runs once
    }, [isGapiLoaded, isGisLoaded, error]); // Added dependencies to checkLoadingComplete logic


    // Function to trigger the sign-in flow
    const handleSignIn = () => {
        if (tokenClient) {
            // Prompt the user to select an account and grant access.
            tokenClient.requestAccessToken({ prompt: 'consent' }); // Use 'consent' to ensure refresh token potentially, or '' for default
        } else {
            console.error('GIS Token Client not initialized yet.');
            setError('Authentication service not ready. Please wait a moment and try again.');
        }
    };

    // Function to sign out (revokes the token)
    const handleSignOut = () => {
        const token = window.gapi?.client?.getToken();
        if (token) {
            window.google.accounts.oauth2.revoke(token.access_token, () => {
                console.log('Token revoked.');
                // GAPI doesn't automatically clear its token state on revoke
                window.gapi.client.setToken(null);
                setIsSignedIn(false);
            });
        } else {
            setIsSignedIn(false); // Already signed out or token not available
        }
    };


    return {
        gapiClient, // The initialized gapi.client object
        handleSignIn,
        handleSignOut,
        isSignedIn,
        isLoading, // Overall loading status of APIs
        error, // Any error during loading/auth
    };
}

export default useGoogleApi;