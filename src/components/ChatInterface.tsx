// src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { getGeminiResponse, scheduleCalendarEventGapi } from '../api/google';
import useGoogleApi from '../hooks/useGoogleApi';
import { MessageData, GeminiContent } from '../types'; // Import types

// Helper (same as before)
const formatMessagesForGemini = (messages: MessageData[]): GeminiContent[] => {
     return messages
       .map(msg => ({
         role: msg.sender === 'user' ? 'user' : 'model',
         parts: [{ text: msg.text }],
       }))
       .filter(msg => msg.role === 'user' || msg.role === 'model') as GeminiContent[];
};

const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<MessageData[]>([]); // Type state
    const [isBotLoading, setIsBotLoading] = useState<boolean>(false);
    const initialLoadDone = useRef<boolean>(false);
    const location = useLocation();

    const {
        gapiClient, handleSignIn, handleSignOut, isSignedIn,
        isLoading: isApiLoading, error: apiError
    } = useGoogleApi();

    // Handle initial message and errors
    useEffect(() => {
        const oauthError = sessionStorage.getItem('oauth_error');
        if (oauthError && !messages.some(m => m.sender === 'System')) {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'System', text: oauthError }]);
            sessionStorage.removeItem('oauth_error');
        }

        if (!initialLoadDone.current && messages.length === 0 && !oauthError) {
            let initialMessage = "Hello! I'm Taffy, your scheduling assistant. How can I help?";
            if (isApiLoading) initialMessage += "\n(Loading Google services...)";
            else if (!isSignedIn && !apiError) initialMessage += "\n(Connect to Google Calendar below.)";
            setMessages([{ id: Date.now(), sender: 'Taffy', text: initialMessage }]);
            initialLoadDone.current = true;
        }
        if (apiError && !messages.some(m => m.sender === 'System' && m.text.includes('Error:'))) {
             setMessages(prev => [...prev, { id: Date.now(), sender: 'System', text: `Error: ${apiError}` }]);
        }
    }, [isApiLoading, isSignedIn, apiError, location.key, messages]); // Add messages to dep array carefully


    const handleSendMessage = async (userInput: string): Promise<void> => { // Type input/return
        if (!userInput || isBotLoading) return;

        const newUserMessage: MessageData = { id: Date.now(), sender: 'user', text: userInput };
        const messagesForHistory = [...messages]; // Capture before adding new user message
        setMessages(prev => [...prev, newUserMessage]);
        setIsBotLoading(true);

        const historyForGemini = formatMessagesForGemini(messagesForHistory);
        const effectiveHistory = historyForGemini.some(msg => msg.role === 'user') ? historyForGemini : [];

        let taffyResponseText = '';
        try {
            taffyResponseText = await getGeminiResponse(userInput, effectiveHistory);

            const lowerInput = userInput.toLowerCase();
            const wantsToSchedule = ['schedule', 'book', 'add event', 'meeting at', 'appointment'].some(kw => lowerInput.includes(kw));

            if (wantsToSchedule) {
                if (isSignedIn && gapiClient?.calendar) {
                    const scheduleResult = await scheduleCalendarEventGapi(userInput, gapiClient);
                    taffyResponseText += `\n\n[Calendar] ${scheduleResult}`;
                } else if (!isSignedIn) {
                    taffyResponseText += "\n\n(Please sign in with Google first.)";
                } else {
                    taffyResponseText += "\n\n(Google Calendar service not ready.)";
                }
            }
        } catch (error: any) { // Type error
            console.error("Error during message handling:", error);
            taffyResponseText = error.message || "Error processing request.";
        } finally {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'Taffy',
                text: taffyResponseText || "Sorry, I couldn't generate a response."
            }]);
            setIsBotLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <h1>Chat with Taffy</h1>
            <div className="auth-section">
                {isApiLoading ? <p>Loading...</p> : apiError ? <p style={{ color: 'red' }}>API Error: {apiError}</p> : isSignedIn ? (
                    <button onClick={handleSignOut} className="auth-button sign-out">Sign Out Google</button>
                ) : (
                    <button onClick={handleSignIn} className="auth-button sign-in" disabled={isApiLoading}>Connect Google Calendar</button>
                )}
            </div>
            <MessageList messages={messages} />
            {isBotLoading && <div className="loading-indicator">Taffy is thinking...</div>}
            <ChatInput onSendMessage={handleSendMessage} isLoading={isBotLoading} />
        </div>
    );
}

export default ChatInterface;