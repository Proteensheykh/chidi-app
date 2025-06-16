"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function WebSocketTester() {
  const { session, user, signIn } = useAuth();
  const [status, setStatus] = useState<string>("Not connected");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const handleTestSignIn = async () => {
    try {
      // Use test credentials - replace with your test user
      await signIn("test@example.com", "password123");
      addLog("Sign in attempt completed");
    } catch (error) {
      addLog(`Sign in error: ${error}`);
    }
  };

  useEffect(() => {
    if (session) {
      addLog(`User authenticated: ${user?.email}`);
      addLog(`Token available: ${session.access_token ? "Yes" : "No"}`);
    } else {
      addLog("No active session");
    }
  }, [session, user]);

  return (
    <Card className="p-6 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">WebSocket Authentication Tester</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Authentication Status</h3>
        <p>User: {user ? user.email : "Not logged in"}</p>
        <p>Session: {session ? "Active" : "None"}</p>
        <p>Token: {session?.access_token ? "Available" : "None"}</p>
      </div>

      <div className="mb-4">
        <Button onClick={handleTestSignIn}>
          Test Sign In
        </Button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">WebSocket Status</h3>
        <p>{status}</p>
      </div>

      <div>
        <h3 className="font-semibold">Logs</h3>
        <div className="bg-gray-100 p-3 rounded h-64 overflow-y-auto text-sm font-mono">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    </Card>
  );
}
