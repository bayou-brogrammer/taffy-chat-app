// src/api/mocks.js

/**
 * Simulates calling the Gemini API.
 * Responds based on keywords in the user input.
 * @param {string} userInput The user's message.
 * @returns {Promise<string>} Taffy's response.
 */
export const mockGeminiAPI = async (userInput) => {
    console.log(`[Mock Gemini] Received input: "${userInput}"`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200)); // 200-1000ms delay

    const lowerInput = userInput.toLowerCase();
    const schedulingKeywords = ['schedule', 'meeting', 'event', 'appointment', 'call', 'book', 'tomorrow', 'today', 'next week', 'at', 'pm', 'am'];

    const containsSchedulingKeyword = schedulingKeywords.some(keyword => lowerInput.includes(keyword));

    if (containsSchedulingKeyword && lowerInput.includes('schedule')) {
        // Simulate attempting to schedule
        const scheduleDetails = extractScheduleDetails(userInput); // Basic extraction
        try {
            const calendarResponse = await mockCalendarAPI(scheduleDetails);
            console.log(`[Mock Gemini] Calendar API response: ${calendarResponse}`);
            // Could potentially use calendarResponse in the reply
            return `Okay, I've noted down the request to schedule: "${scheduleDetails || userInput}". Consider it handled!`;
        } catch (error) {
            console.error("[Mock Gemini] Calendar API simulation failed:", error);
            return "I tried to schedule that, but there was an issue connecting to the calendar.";
        }
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
         return "Hello there! I'm Taffy. How can I help you with scheduling today?";
    } else if (lowerInput.includes('how are you')) {
        return "I'm doing great, ready to schedule!";
    } else if (lowerInput.includes('math')) {
        // Example using LaTeX requirement
        return `Did you mention math? Remember that an inline expression looks \( like = mc^2 \) and a display expression looks $$ \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2} $$.`;
    }
     else {
        return `I can help with scheduling tasks and events. Try asking me to "schedule a meeting tomorrow at 3 pm".`;
    }
};

/**
 * Simulates adding an event to a calendar API.
 * @param {string} details Information about the event to schedule.
 * @returns {Promise<string>} A success message or throws an error.
 */
export const mockCalendarAPI = async (details) => {
    console.log(`[Mock Calendar] Received request to schedule: "${details}"`);
    // Simulate network delay/processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100)); // 100-600ms delay

    // Simulate potential failure rate (e.g., 10% chance)
    if (Math.random() < 0.1) {
        console.error("[Mock Calendar] Simulated calendar API error.");
        throw new Error("Simulated calendar conflict or API error.");
    }

    console.log(`[Mock Calendar] Successfully processed scheduling for: "${details}"`);
    return "Event scheduling simulated successfully.";
};

/**
 * Basic function to extract details (very simplistic).
 * In a real app, this would involve NLP.
 * @param {string} userInput
 * @returns {string} Extracted detail or original input
 */
const extractScheduleDetails = (userInput) => {
    // Super simple extraction - just return the part after "schedule"
    const match = userInput.match(/schedule\s+(.*)/i);
    return match ? match[1].trim() : userInput; // Return the captured group or the original input
}