# Taffy - AI Scheduling Assistant

Taffy is a simple web application demonstrating a chat interface where users can interact with an AI assistant named "Taffy" to schedule events in their Google Calendar. It utilizes the Google Generative AI (Gemini) API for natural language understanding and conversation, and the Google Calendar API (via GAPI/GIS) for scheduling.

This project is built with React, Vite, and TypeScript.

## Screenshots

![Taffy Chat Main Interface](https://github.com/user-attachments/assets/3fa24ebc-4acf-4a4f-a427-74f21a202265)
![Taffy Scheduling Confirmation](https://github.com/user-attachments/assets/ec5e47f3-c4c2-46d0-9d3f-048a2d36fa03)

## Features

*   **Chat Interface:** Basic UI for sending messages to and receiving messages from Taffy.
*   **AI Persona:** Interaction with "Taffy", powered by Google's Gemini Pro model.
*   **Google Calendar Integration:** Schedule events directly into the user's primary Google Calendar using natural language requests (e.g., "schedule meeting tomorrow at 2 pm").
*   **Google OAuth 2.0:** Secure authentication using Google Identity Services (Redirect Flow) to get user permission for calendar access.
*   **TypeScript:** Type safety for improved development experience and code maintainability.
*   **Vite:** Fast development server and build tool.

## Tech Stack

*   **Frontend Framework:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Routing:** React Router DOM
*   **API Integration:**
    *   Google Generative AI SDK (`@google/generative-ai`)
    *   Google API Client Library for JavaScript (GAPI)
    *   Google Identity Services (GIS) for Authentication
*   **Styling:** CSS

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn package manager
*   A Google Account
*   A Google Cloud Platform (GCP) Project

## Google Cloud Setup & API Keys

You need to configure a GCP project and obtain API credentials:

1.  **Create/Select GCP Project:** Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project or select an existing one.
2.  **Enable APIs:**
    *   Navigate to "APIs & Services" > "Library".
    *   Search for and **Enable** the following APIs:
        *   **Google Calendar API**
        *   **Google Generative AI API** (or ensure your project has access to Gemini models)
        *   *(Optional but recommended)* **API Discovery Service**
3.  **Create Gemini API Key:**
    *   Go to "APIs & Services" > "Credentials".
    *   Click "+ CREATE CREDENTIALS" > "API key".
    *   **Restrict the Key (Recommended):**
        *   Click on the newly created key name.
        *   Under **API restrictions**:
            *   Select "Restrict key".
            *   Add "Google Generative AI API" (or "Generative Language API") and "Google Calendar API" to the list of allowed APIs.
        *   Under **Application restrictions**:
            *   Select "HTTP referrers (web sites)".
            *   Add your development origin(s) under "Website restrictions" (e.g., `http://localhost:5173`).
        *   Click "Save".
    *   Copy the generated API Key. You'll need it for the `.env` file.
4.  **Create OAuth 2.0 Client ID:**
    *   Go to "APIs & Services" > "Credentials".
    *   Click "+ CREATE CREDENTIALS" > "OAuth client ID".
    *   Select "Web application" as the Application type.
    *   Give it a name (e.g., "Taffy Chat Web Client").
    *   Under **Authorized JavaScript origins**:
        *   Add your development origin (e.g., `http://localhost:5173`).
    *   Under **Authorized redirect URIs**:
        *   Add the callback URL defined in the application (e.g., `http://localhost:5173/oauth2callback`).
    *   Click "Create".
    *   Copy the generated **Client ID**. You'll need it for the `.env` file.
5.  **Configure OAuth Consent Screen:**
    *   Go to "APIs & Services" > "OAuth consent screen".
    *   Choose "External" (unless you are a Workspace user).
    *   Fill in the required information (App name, User support email, Developer contact).
    *   **Scopes:** Add the necessary scopes:
        *   `https://www.googleapis.com/auth/calendar.events`
        *   `https://www.googleapis.com/auth/calendar.readonly` (if used)
        *   `openid`
        *   `email`
        *   `profile`
    *   **Test Users:** While in "Testing" mode, add the Google Account email(s) you will use for testing.
    *   Save the consent screen configuration.

## Environment Variables

Create a `.env` file in the root of the project directory. **Do not commit this file to Git.** Add your `.env` file to your `.gitignore`.

Copy the following format into your `.env` file and replace the placeholder values with your actual credentials:

```dotenv
# .env

# Your Gemini API Key from Google Cloud Credentials
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Your OAuth 2.0 Client ID from Google Cloud Credentials
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com
```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/taffy-chat-app.git
    cd taffy-chat-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).
3.  Click "Connect Google Calendar" to initiate the OAuth flow.
4.  Grant permissions.
5.  Start chatting with Taffy and try scheduling events!

## Future Improvements (Possible Roadmap)

*   Implement robust Natural Language Processing (NLP) for date/time/event detail extraction (e.g., using Gemini Function Calling).
*   Move API key handling and potentially OAuth token management to a secure backend proxy for production use.
*   Improve UI/UX and error handling.
*   Add features like viewing upcoming events, deleting scheduled events, etc.
*   Implement more sophisticated state management if the app grows.
*   Add unit and integration tests.
*   Provide deployment instructions.