"use client";

import { useEffect } from "react";
import { pushSessionHistoryId } from "@/lib/session-history";

type TrackSessionHistoryProps = {
  sessionId: string;
};

export default function TrackSessionHistory({
  sessionId,
}: TrackSessionHistoryProps) {
  useEffect(() => {
    pushSessionHistoryId(sessionId);
  }, [sessionId]);

  return null;
}
