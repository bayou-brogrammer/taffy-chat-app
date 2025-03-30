// src/types.d.ts

// Define MessageData type for chat messages
export interface MessageData {
    id: number;
    sender: 'user' | 'Taffy' | 'System';
    text: string;
}

// Gemini Types
export interface GeminiPart {
    text: string;
}
export interface GeminiContent {
    role: 'user' | 'model';
    parts: GeminiPart[];
}

// --- Manual Types for GAPI/GIS ---
// GAPI Client (basic structure - expand as needed)
export interface GapiClient {
    calendar?: {
        events: {
            insert: (args: { calendarId: string; resource: CalendarEventResource }) => Promise<GapiResponse<CalendarEvent>>;
        };
    };
    getToken: () => GapiToken | null;
    setToken: (token: GapiToken | null) => void;
    // Add other potential methods/properties if used
    [key: string]: any; // Allow other properties potentially added by gapi.client.init
}

export interface GapiToken {
    access_token: string;
    expires_in?: number; // comes as number from GIS, string from gapi? Be flexible
    expires_at?: number; // Add this if calculating manually
    scope?: string;
    token_type?: string;
    // Other potential fields
}

// Google Identity Services (GIS) Token Client
export interface TokenClient {
    requestAccessToken: (options?: { prompt?: string; hint?: string }) => void;
}

// GIS Token Response (from callback/storage)
export interface StoredTokenData {
    access_token: string;
    expires_at: number; // Timestamp calculated from expires_in
}

// GAPI Response Wrapper (Generic)
export interface GapiResponse<T> {
    result: T;
    body: string; // Raw response body
    headers?: Record<string, string>;
    status?: number;
    statusText?: string;
}

// Basic Google Calendar Event Structure (for insert resource)
export interface CalendarEventDateTime {
    dateTime?: string; // ISO string for timed events
    date?: string; // YYYY-MM-DD for all-day events
    timeZone?: string;
}

export interface CalendarEventResource {
    summary: string;
    description?: string;
    start: CalendarEventDateTime;
    end: CalendarEventDateTime;
}

// Actual Calendar Event (response from insert) - Expand as needed
export interface CalendarEvent extends CalendarEventResource {
    id: string;
    htmlLink?: string;
    status?: string;
    // etc.
}

// GIS Error Object (from error_callback or hash)
export interface GisError {
    type?: string; // e.g., 'popup_closed_by_user'
    message?: string;
    // Other fields might exist
    [key: string]: any;
}

// Make GAPI/GIS objects available on window (declare global)
declare global {
    interface Window {
        gapi?: any; // Use 'any' for simplicity or build out more specific types
        google?: any; // Use 'any' for simplicity or build out more specific types
    }
}