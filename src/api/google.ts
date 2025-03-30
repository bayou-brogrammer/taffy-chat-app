// src/api/google.js (Updated)
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Gemini Configuration ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: VITE_GEMINI_API_KEY is not set in .env file.");
}

const generationConfig = {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 256,
};

const SYSTEM_INSTRUCTION = `You are Taffy, a friendly and helpful scheduling assistant.
Your primary function is to help users schedule events and tasks in their Google Calendar.
Be concise and confirm scheduling requests clearly.
If a user asks you to schedule something, acknowledge it and indicate you will attempt to add it to their calendar.
If the request is unclear (e.g., missing date/time), ask for clarification.
If the user asks about math, you can mention LaTeX like \\( E = mc^2 \\) or $$ \\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6} $$.
Keep responses relatively short and focused on the scheduling task or casual conversation.`;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash",systemInstruction: SYSTEM_INSTRUCTION });


export const getGeminiResponse = async (userInput, chatHistory) => {
    if (!GEMINI_API_KEY) return "Sorry, my connection to Google AI is not configured.";
    console.log("[Gemini API] Sending prompt:", userInput);
    // ... rest of Gemini function remains the same ...
    try {
        const chat = model.startChat({ history: chatHistory, generationConfig });
        const result = await chat.sendMessage(userInput);
        const text = result.response.text();
        console.log("[Gemini API] Received response:", text);
        return text;
    } catch (error) {
        console.error("[Gemini API] Error:", error);
        return "Sorry, I encountered an error trying to understand that.";
    }
};


// --- Google Calendar Function (using GAPI) ---

/**
 * Attempts to schedule an event in Google Calendar using GAPI.
 * Assumes GAPI client is loaded and user is signed in via GIS.
 *
 * @param {string} details Natural language description (e.g., "meeting tomorrow at 2pm").
 * @param {object} gapiClient The initialized gapi.client object.
 * @returns {Promise<string>} Confirmation or error message.
 */
export const scheduleCalendarEventGapi = async (details, gapiClient) => {
    console.log(`[GAPI Calendar] Attempting to schedule: "${details}"`);

    if (!gapiClient || !gapiClient.calendar) {
         console.error("[GAPI Calendar] GAPI client or Calendar API not ready.");
         return "Sorry, the connection to Google Calendar is not ready yet.";
     }

    // Check if user is authenticated (GAPI client might have token implicitly via GIS)
    // A more robust check might involve checking gapi.client.getToken(), but GIS manages this.
    // We rely on the calling component checking its own isSignedIn state.

    // --- NLP Placeholder (same basic logic as before) ---
    console.warn("[GAPI Calendar] NLP step skipped. Using placeholder event details.");
    let eventTitle = `Scheduled by Taffy: ${details.substring(0, 50)}`;
    let startDateTime, endDateTime;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
        const timeMatch = details.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
        if (timeMatch) {
             let hours = parseInt(timeMatch[1], 10);
             const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
             const period = timeMatch[3].toLowerCase();
             if (period === 'pm' && hours < 12) hours += 12;
             if (period === 'am' && hours === 12) hours = 0;
             startDateTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), hours, minutes);
             endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
        } else {
            console.warn("[GAPI Calendar] Could not parse time. Creating all-day event.");
             startDateTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
             endDateTime = new Date(startDateTime); // Same start/end date for all-day
             eventTitle += " (All Day - Time Unspecified)";
             startDateTime = startDateTime.toISOString().split('T')[0]; // Format as YYYY-MM-DD
             endDateTime = endDateTime.toISOString().split('T')[0];
        }

        const event = {
             summary: eventTitle,
             description: `Event scheduled by Taffy Assistant based on request: "${details}"`,
             start: {},
             end: {},
         };

         if (typeof startDateTime === 'string') { // All-day
             event.start.date = startDateTime;
             event.end.date = endDateTime; // Google Calendar API handles single all-day events correctly
         } else { // Timed
             event.start.dateTime = startDateTime.toISOString();
             event.start.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
             event.end.dateTime = endDateTime.toISOString();
             event.end.timeZone = event.start.timeZone;
         }

        console.log("[GAPI Calendar] Creating event resource:", event);

        // Use gapi.client to make the API call
        const request = gapiClient.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event // Note: parameter is 'resource' not 'requestBody'
        });

        // Execute the request
        const response = await request; // GAPI requests return promises directly

        console.log('[GAPI Calendar] Event created:', response.result.htmlLink);
        return `Okay, I've scheduled "${response.result.summary}" in your calendar. View it: ${response.result.htmlLink}`;

    } catch (error) {
         console.error('[GAPI Calendar] Error creating event:', error);
         // GAPI errors often have a 'result.error' structure
         const errorMsg = error.result?.error?.message || error.message || 'Unknown error';
         if (error.status === 401 || errorMsg.includes("invalid credential") || errorMsg.includes("Invalid Credentials")) {
             // This might indicate the token expired or is invalid.
             // The GIS library *might* handle refresh automatically, but explicit re-auth might be needed.
             return "Your Google Calendar session might have expired. Please try signing in again.";
         }
         if (error.status === 403) {
            return `Sorry, I don't have permission to add events to this calendar. Please check your Google Calendar sharing settings or ensure you granted the correct permissions. (${errorMsg})`;
         }
         return `Sorry, I couldn't schedule that. There was an error: ${errorMsg}`;
    }
};