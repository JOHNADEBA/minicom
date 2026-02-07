import { Role, ROLE } from "./constants";

export const getRole = (): Role => {
  if (typeof window === "undefined") return ROLE.VISITOR; // default to visitor in SSR
  return window.location.pathname.startsWith("/agent")
    ? ROLE.AGENT
    : ROLE.VISITOR; // default to visitor in SSR
};
