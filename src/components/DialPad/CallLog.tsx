import  { useState, useEffect } from "react";
import { useNotification } from "@telnyx/react-client";

function CallLog() {
  const notification = useNotification();
  const [clientStateLog, setClientStateLog] = useState<{
    type: string;
    state?: string;
  }>({ type: "", state: "" });

  useEffect(() => {
    if (notification?.type !== "callUpdate") return;

    setClientStateLog({
      type: notification.type,
      state: notification.call?.state,
    });
  }, [notification]);

  const getDisplayState = (state: string | undefined) => {
    if (!state) return "";

    switch (state) {
      case "new":
      case "requesting":
      case "trying":
      case "early":
        return "Calling";
      case "active":
        return "";
      case "hangup":
      case "destroy":
        return "Call Ended";
      default:
        return "";
    }
  };

  return (
    <div className="text-center">
      {clientStateLog ? (
        <p>
          {clientStateLog.state && (
            <span>
             {getDisplayState(clientStateLog.state)}
            </span>
          )}
        </p>
      ) : (
        <p>No call information available.</p>
      )}
    </div>
  );
}

export default CallLog;
