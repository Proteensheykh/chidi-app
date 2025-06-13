# Manual Test Plan for Onboarding WebSocket Integration

This document outlines steps to manually test the WebSocket integration between the frontend and backend for the onboarding flow.

## Prerequisites

1. Backend server running on http://localhost:8000
2. Frontend development server running on http://localhost:3000
3. User authenticated with Supabase

## Test Cases

### Test Case 1: Connection Establishment

**Steps:**
1. Navigate to http://localhost:3000/onboarding
2. Open browser developer tools and check the console
3. Verify WebSocket connection is established
4. Verify welcome message is displayed in the chat

**Expected Results:**
- Console shows "WebSocket connected" message
- Chat displays welcome message from the assistant
- No connection errors are shown

### Test Case 2: Sending and Receiving Text Messages

**Steps:**
1. Type a message in the chat input (e.g., "Hello, I'm setting up my workspace")
2. Press Enter or click the send button
3. Observe the chat interface

**Expected Results:**
- User message appears in the chat
- Typing indicator is shown
- Assistant responds with a message
- Onboarding progress is updated

### Test Case 3: Option Selection

**Steps:**
1. Wait for the assistant to present options (e.g., business type selection)
2. Click on one of the options (e.g., "Technology")
3. Observe the chat interface

**Expected Results:**
- Selected option is highlighted
- Selection is sent to the server
- Assistant acknowledges the selection
- Onboarding progress is updated

### Test Case 4: Form Submission

**Steps:**
1. Wait for the assistant to present a form (e.g., business details)
2. Fill in the form fields
3. Submit the form
4. Observe the chat interface

**Expected Results:**
- Form data is sent to the server
- Assistant acknowledges the submission
- Onboarding progress is updated

### Test Case 5: Action Trigger

**Steps:**
1. Wait for the assistant to present an action card (e.g., file upload)
2. Click on the action button
3. Complete the action (e.g., select a file)
4. Observe the chat interface

**Expected Results:**
- Action is triggered
- Assistant acknowledges the action
- Onboarding progress is updated

### Test Case 6: Connection Resilience

**Steps:**
1. Establish a WebSocket connection
2. Temporarily disable network connection
3. Re-enable network connection
4. Observe the chat interface

**Expected Results:**
- Connection error is shown when network is disabled
- Reconnection attempts are made automatically
- Connection is re-established when network is available
- Chat history is preserved

## Troubleshooting

If tests fail, check the following:

1. Backend server logs for errors
2. Frontend console for WebSocket errors
3. Network tab in browser developer tools for WebSocket frames
4. Authentication token validity
5. CORS configuration on the backend

## Notes

- These tests focus on the WebSocket communication between frontend and backend
- They verify that messages are properly sent, received, and processed
- They ensure the UI updates correctly based on WebSocket events
- They check connection resilience and error handling
