import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { createServerClient } from '@supabase/ssr';

// Mock Next.js and Supabase
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

describe('Auth Middleware', () => {
  // Mock environment variables
  const originalEnv = process.env;
  
  // Mock request, response and session
  let mockReq: jest.Mocked<NextRequest>;
  let mockRes: jest.Mocked<NextResponse>;
  let mockSupabase: any;
  let mockGetSession: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
    };
    
    // Mock request
    mockReq = {
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'mock-cookie-value' }),
      },
      nextUrl: {
        pathname: '/dashboard',
        searchParams: {
          set: jest.fn(),
        },
      },
      url: 'https://example.com/dashboard',
    } as unknown as jest.Mocked<NextRequest>;
    
    // Mock response
    mockRes = {
      cookies: {
        set: jest.fn(),
      },
    } as unknown as jest.Mocked<NextResponse>;
    
    (NextResponse.next as jest.Mock).mockReturnValue(mockRes);
    (NextResponse.redirect as jest.Mock).mockImplementation((url) => ({ redirected: true, url }));
    
    // Mock Supabase client
    mockGetSession = jest.fn();
    mockSupabase = {
      auth: {
        getSession: mockGetSession,
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  test('creates Supabase client with correct parameters', async () => {
    // Mock session
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
    
    await middleware(mockReq);
    
    // Verify Supabase client was created with correct parameters
    expect(createServerClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'mock-anon-key',
      expect.objectContaining({
        cookies: expect.any(Object),
      })
    );
  });
  
  test('allows authenticated users to access protected routes', async () => {
    // Mock authenticated session
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
    
    // Set protected route
    mockReq.nextUrl.pathname = '/dashboard';
    
    const result = await middleware(mockReq);
    
    // Should return the next response without redirecting
    expect(result).toBe(mockRes);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
  
  test('redirects unauthenticated users from protected routes to login', async () => {
    // Mock unauthenticated session
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    // Set protected route
    mockReq.nextUrl.pathname = '/dashboard';
    
    await middleware(mockReq);
    
    // Should redirect to login with redirect parameter
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/auth/login',
      })
    );
  });
  
  test('redirects authenticated users from auth routes to dashboard', async () => {
    // Mock authenticated session
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
    
    // Set auth route
    mockReq.nextUrl.pathname = '/auth/login';
    
    await middleware(mockReq);
    
    // Should redirect to dashboard
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/dashboard',
      })
    );
  });
  
  test('allows unauthenticated users to access auth routes', async () => {
    // Mock unauthenticated session
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    // Set auth route
    mockReq.nextUrl.pathname = '/auth/login';
    
    const result = await middleware(mockReq);
    
    // Should return the next response without redirecting
    expect(result).toBe(mockRes);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
  
  test('allows access to public routes regardless of auth status', async () => {
    // Mock unauthenticated session
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    // Set public route
    mockReq.nextUrl.pathname = '/_next/static/chunks/main.js';
    
    const result = await middleware(mockReq);
    
    // Should return the next response without redirecting
    expect(result).toBe(mockRes);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
  
  test('allows access to API routes regardless of auth status', async () => {
    // Mock unauthenticated session
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    // Set API route
    mockReq.nextUrl.pathname = '/api/health';
    
    const result = await middleware(mockReq);
    
    // Should return the next response without redirecting
    expect(result).toBe(mockRes);
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
  
  test('handles cookie operations correctly', async () => {
    // Mock authenticated session
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
    
    await middleware(mockReq);
    
    // Get the cookie handling functions passed to createServerClient
    const cookieFunctions = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
    
    // Test get function
    cookieFunctions.get('test-cookie');
    expect(mockReq.cookies.get).toHaveBeenCalledWith('test-cookie');
    
    // Test set function
    cookieFunctions.set('test-cookie', 'test-value', { maxAge: 3600 });
    expect(mockRes.cookies.set).toHaveBeenCalledWith({
      name: 'test-cookie',
      value: 'test-value',
      maxAge: 3600,
    });
    
    // Test remove function
    cookieFunctions.remove('test-cookie', { path: '/' });
    expect(mockRes.cookies.set).toHaveBeenCalledWith({
      name: 'test-cookie',
      value: '',
      path: '/',
    });
  });
});
