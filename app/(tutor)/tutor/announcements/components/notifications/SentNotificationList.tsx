import React from "react";
import { format } from "date-fns";
import "./SentNotificationList.css";

interface Notification {
  id?: string;
  title: string;
  message: string;
  sender_name?: string;
  sent_to: string | null;
  created_at: string;
}

const recipientMap: Record<string, string> = {
  "2": "Tutors",
  "3": "Students",
  "4": "Institutes",
};

const SentNotificationList = ({
  notifications,
}: {
  notifications: Notification[];
}) => {
  const getRecipientLabels = (sent_to: string | null) => {
    if (!sent_to) return ["(No recipients)"];

    const ids = sent_to.split(",").map((id) => id.trim()).sort();
    const isAll = ["2", "3", "4"].every((v) => ids.includes(v)) && ids.length === 3;

    if (isAll) return ["ALL"];
    return ids.map((id) => recipientMap[id] || `ID: ${id}`);
  };

  return (
    <div className="px-0">
      {notifications.length === 0 ? (
        <div className="text-start text-muted py-4">No sent notifications.</div>
      ) : (
        <div className="notification-list">
          {notifications.map((n, idx) => {
            const recipientLabels = getRecipientLabels(n.sent_to);

            return (
              <div key={n.id || idx}>
                <div className="notification-row align-items-center mb-3">
                     {/* Recipients moved below title for better UI */}
                  <div className="notification-recipients mb-2 mt-1 d-flex align-items-center gap-1">
                    <span className="small me-1">To:</span>
                    {recipientLabels.map((label, i) => (
                      <span key={i} className="recipient-label badge rounded-pill text-white px-2 py-1 small">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="notiglow"></div>
                  <div className="notiborderglow"></div>
                  <div className="notititle">{n.title}</div>
                  
                  <div className="notibody">
                    {n.message.length > 120
                      ? n.message.slice(0, 120) + "…"
                      : n.message}
                  </div>
             
                  <div className="notification-date">
                    {format(new Date(n.created_at), "MMM dd, yyyy hh:mm a")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SentNotificationList;
