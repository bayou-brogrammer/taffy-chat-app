import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoredTokenData } from '../types'; // Import type

const SESSION_STORAGE_KEY = 'google_oauth_token'; // Use the same key

const OAuthCallback: React.FC = () => { // Type as Functional Component
    const navigate = useNavigate(); // Hook type inferred

    useEffect(() => {
        console.log('OAuthCallback mounted, processing hash...');
        try {
            if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const expiresIn = params.get('expires_in'); // String from URL
                const error = params.get('error');

                if (error) {
                    console.error('OAuth Error received:', error);
                    sessionStorage.setItem('oauth_error', `Google Sign-In Error: ${error}`);
                    navigate('/', { replace: true });
                    return;
                }

                if (accessToken && expiresIn) {
                    const expiresInNum = parseInt(expiresIn, 10);
                    if (isNaN(expiresInNum)) {
                       throw new Error("Invalid expires_in value received.");
                    }
                    const expiresAt = Date.now() + expiresInNum * 1000;

                    const tokenData: StoredTokenData = { // Use interface
                        access_token: accessToken,
                        expires_at: expiresAt
                    };

                    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(tokenData));
                    console.log("Token stored in session storage.");
                    navigate('/', { replace: true });

                } else {
                    console.error('OAuthCallback: access_token or expires_in missing in hash.');
                    sessionStorage.setItem('oauth_error', 'Failed to get token from Google redirect.');
                    navigate('/', { replace: true });
                }

            } else {
                console.warn('OAuthCallback: No hash found in URL.');
                navigate('/', { replace: true });
            }
        } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            console.error("Error processing OAuth callback:", error);
            sessionStorage.setItem('oauth_error', `Error processing Google Sign-In callback: ${error}`);
            navigate('/', { replace: true });
        }

    }, [navigate]);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Processing Google Sign-In...</h2>
            <p>Please wait, you will be redirected shortly.</p>
        </div>
    );
}

export default OAuthCallback;