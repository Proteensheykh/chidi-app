"use client";

import { WebSocketTester } from "@/components/debug/WebSocketTester";

export default function WebSocketDebugPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">WebSocket Debug</h1>
      <WebSocketTester />
    </div>
  );
}
