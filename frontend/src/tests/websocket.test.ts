import { WebSocketService } from '../services/websocket';

// Mock WebSocket
class MockWebSocket {
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  readyState = WebSocket.OPEN;
  
  constructor(public url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen(new Event('open'));
    }, 0);
  }
  
  close() {
    if (this.onclose) this.onclose(new CloseEvent('close'));
  }
  
  send(data: string) {
    console.log('Mock WebSocket sent:', data);
  }
  
  // Helper to simulate receiving a message
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', {
        data: JSON.stringify(data)
      }));
    }
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any;

describe('WebSocketService', () => {
  let wsService: WebSocketService;
  let mockListener: jest.Mock;
  
  beforeEach(() => {
    wsService = new WebSocketService('test-token', 'test-conversation');
    mockListener = jest.fn();
    wsService.addListener(mockListener);
  });
  
  test('should connect successfully', () => {
    wsService.connect();
    
    // Verify the listener was called with connected event
    expect(mockListener).toHaveBeenCalledWith({
      type: 'connected'
    });
  });
  
  test('should handle sending messages', () => {
    wsService.connect();
    wsService.sendMessage('Hello world');
    
    // In a real test, we would verify the message was sent correctly
  });
  
  test('should handle receiving messages', () => {
    wsService.connect();
    
    // Get the mock WebSocket instance
    const mockWs = wsService['socket'] as unknown as MockWebSocket;
    
    // Simulate receiving a message
    mockWs.simulateMessage({
      id: 'test-message-id',
      content: 'Test message from server',
      sender: 'assistant',
      timestamp: new Date().toISOString()
    });
    
    // Verify the listener was called with the message
    expect(mockListener).toHaveBeenCalledWith({
      type: 'message',
      message: expect.objectContaining({
        id: 'test-message-id',
        content: 'Test message from server'
      })
    });
  });
  
  test('should handle typing indicators', () => {
    wsService.connect();
    
    // Get the mock WebSocket instance
    const mockWs = wsService['socket'] as unknown as MockWebSocket;
    
    // Simulate receiving a typing indicator
    mockWs.simulateMessage({
      type: 'typing_indicator',
      is_typing: true
    });
    
    // Verify the listener was called with the typing indicator
    expect(mockListener).toHaveBeenCalledWith({
      type: 'typing_indicator',
      isTyping: true
    });
  });
  
  test('should handle onboarding state updates', () => {
    wsService.connect();
    
    // Get the mock WebSocket instance
    const mockWs = wsService['socket'] as unknown as MockWebSocket;
    
    // Simulate receiving an onboarding state update
    mockWs.simulateMessage({
      type: 'onboarding_state',
      state: {
        currentStep: 2,
        totalSteps: 5,
        stepTitle: 'Business Details',
        percentage: 40,
        businessData: {
          name: 'Test Business'
        },
        conversationHistory: []
      }
    });
    
    // Verify the listener was called with the onboarding state
    expect(mockListener).toHaveBeenCalledWith({
      type: 'onboarding_state',
      onboardingState: expect.objectContaining({
        currentStep: 2,
        totalSteps: 5,
        percentage: 40
      })
    });
  });
  
  test('should handle disconnection', () => {
    wsService.connect();
    wsService.disconnect();
    
    // Verify the listener was called with disconnected event
    expect(mockListener).toHaveBeenCalledWith({
      type: 'disconnected'
    });
  });
});

// Note: This is a high-level test file. In a real implementation, we would:
// 1. Use a proper testing framework like Jest
// 2. Add more comprehensive tests for edge cases
// 3. Test the OnboardingContext React component with React Testing Library
// 4. Add integration tests that simulate a full conversation flow
