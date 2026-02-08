"use client";

import { InboxList } from "@/components/agent/InboxList";

export default function AgentPage() {
  return (
    <div className="h-full md:hidden">
      <InboxList />
    </div>
  );
}
