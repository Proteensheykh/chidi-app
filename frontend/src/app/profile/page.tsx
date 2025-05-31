'use client';

import { UserProfile } from '@/components/auth/user-profile';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 md:px-8">
      <h1 className="text-2xl font-semibold mb-6 text-[#1F2937]">Your Profile</h1>
      <UserProfile />
    </div>
  );
}
