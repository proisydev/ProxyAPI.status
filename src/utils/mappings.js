// https://uptimerobot.com/api/#parameters

export const monitorTypeMapping = {
  1: "HTTP(s)",
  2: "Keyword",
  3: "Ping",
  4: "Port",
  5: "Heartbeat",
};

export const monitorSubTypeMapping = {
  1: "HTTP (80)",
  2: "HTTPS (443)",
  3: "FTP (21)",
  4: "SMTP (25)",
  5: "POP3 (110)",
  6: "IMAP (143)",
  99: "Custom Port",
};

export const monitorStatusMapping = {
  0: "paused",
  1: "not checked yet",
  2: "up",
  8: "seems down",
  9: "down",
};

export const monitorKeywordTypeMapping = {
  1: "exists",
  2: "not exists",
};

export const monitorKeywordCaseTypeMapping = {
  0: "case sensitive",
  1: "case insensitive",
};

export const montirHttpAuthTypeMapping = {
  1: "HTTP Basic Auth",
  2: "Digest",
};

export const monitorHttpMethodMapping = {
  1: "HEAD",
  2: "GET",
  3: "POST",
  4: "PUT",
  5: "PATCH",
  6: "DELETE",
  7: "OPTIONS",
};

export const monitorPostTypeMapping = {
  1: "key-value",
  2: "raw data",
};

export const postContentTypeMapping = {
  0: "text/html",
  1: "application/json",
};

export const alertContactTypeMapping = {
  1: "sms",
  2: "e-mail",
  3: "x (twitter)",
  5: "webhook",
  6: "pushbullet",
  7: "zapier",
  8: "pro-sms",
  9: "pushover",
  11: "slack",
  14: "voice-call",
  15: "splunk",
  16: "pagerduty",
  17: "opsgenie",
  20: "ms-teams",
  21: "google-chat",
  23: "discord",
};

export const alertContentStatusMapping = {
  0: "not activated",
  1: "paused",
  2: "active",
};

export const mwindowTypeMapping = {
  1: "Once",
  2: "Daily",
  3: "Weekly",
  4: "Monthly",
};

export const mwindowStatusMapping = {
  0: "paused",
  1: "active",
};

export const pspSortMapping = {
  1: "friendly name (a-z)",
  2: "friendly name (z-a)",
  3: "status (up-down-paused)",
  4: "status (down-up-paused)",
};

export const pspStatusMapping = {
  0: "paused",
  1: "active",
};
