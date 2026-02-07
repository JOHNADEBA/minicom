"use client";

import { useParams } from "next/navigation";

import { ThreadView } from "@/components/agent/ThreadView";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ErrorFallback } from "@/components/shared/ErrorFallback";

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();

  return (
    <ErrorBoundary key={threadId} fallback={<ErrorFallback />}>
      <ThreadView threadId={threadId} />
    </ErrorBoundary>
  );
}
