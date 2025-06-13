import { OnboardingMessage, OnboardingState } from '@/types/onboarding';

export type WebSocketEventType = 
  | 'connected'
  | 'disconnected'
  | 'message'
  | 'typing_indicator'
  | 'onboarding_state'
  | 'option_selected'
  | 'form_submitted'
  | 'action_response'
  | 'error';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data?: any;
  message?: OnboardingMessage;
  isTyping?: boolean;
  onboardingState?: OnboardingState;
  error?: string;
}

export type WebSocketEventListener = (event: WebSocketEvent) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: WebSocketEventListener[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private token: string;
  private conversationId?: string;
  private url: string;

  constructor(token: string, conversationId?: string) {
    this.token = token;
    this.conversationId = conversationId;
    
    // Construct the WebSocket URL with query parameters
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = baseUrl.replace(/^https?:\/\//, `${wsProtocol}://`);
    
    let wsUrl = `${wsBaseUrl}/api/v1/onboarding/ws?token=${token}`;
    if (conversationId) {
      wsUrl += `&conversation_id=${conversationId}`;
    }
    
    this.url = wsUrl;
  }

  public connect(): void {
    if (this.socket) {
      this.disconnect();
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyListeners({
          type: 'connected'
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'typing_indicator') {
            this.notifyListeners({
              type: 'typing_indicator',
              isTyping: data.is_typing
            });
          } else if (data.type === 'onboarding_state') {
            this.notifyListeners({
              type: 'onboarding_state',
              onboardingState: data.state
            });
          } else if (data.type === 'option_selected') {
            this.notifyListeners({
              type: 'option_selected',
              data: {
                optionId: data.optionId,
                optionValue: data.optionValue
              }
            });
          } else if (data.type === 'form_submitted') {
            this.notifyListeners({
              type: 'form_submitted',
              data: {
                formData: data.formData
              }
            });
          } else if (data.type === 'action_response') {
            this.notifyListeners({
              type: 'action_response',
              data: {
                actionType: data.actionType,
                status: data.status
              }
            });
          } else if (data.type === 'error') {
            this.notifyListeners({
              type: 'error',
              error: data.content
            });
          } else {
            // Handle regular messages
            this.notifyListeners({
              type: 'message',
              message: data
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket closed with code ${event.code}`);
        this.notifyListeners({
          type: 'disconnected'
        });

        // Attempt to reconnect if not closed intentionally
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners({
          type: 'error',
          error: 'WebSocket connection error'
        });
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.attemptReconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnected');
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public sendMessage(content: string): void {
    this.sendData({
      type: 'user_message',
      content
    });
  }

  public sendOptionSelection(optionId: string, optionValue: string): void {
    this.sendData({
      type: 'option_selection',
      optionId,
      optionValue
    });
  }

  public sendFormSubmission(formData: Record<string, any>): void {
    this.sendData({
      type: 'form_submission',
      formData
    });
  }

  public sendActionTrigger(actionType: string, actionData?: any): void {
    this.sendData({
      type: 'action_trigger',
      actionType,
      actionData
    });
  }

  private sendData(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
      this.notifyListeners({
        type: 'error',
        error: 'WebSocket is not connected'
      });
      
      // Try to reconnect
      this.connect();
    }
  }

  public addListener(listener: WebSocketEventListener): () => void {
    this.listeners.push(listener);
    
    // Return a function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(event: WebSocketEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting to reconnect in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
}
