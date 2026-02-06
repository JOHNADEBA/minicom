'use client';

import { useParams } from 'next/navigation';
import { ThreadView } from '@/components/agent/ThreadView';

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  return <ThreadView threadId={threadId} />;
}
