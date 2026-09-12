import { eveChannel } from "eve/channels/eve";
import { localDev, vercelOidc, type AuthFn } from "eve/channels/auth";

import { verifySessionToken } from "../lib/session";

const appSession: AuthFn<Request> = async (request) => {
  const session = await verifySessionToken(request.headers.get("cookie"));
  if (!session) return null;

  return {
    attributes: {},
    authenticator: "app",
    issuer: "bot",
    principalId: session.userId,
    principalType: "user",
  };
};

export default eveChannel({
  auth: [
    // The browser UI: a signed session cookie set by /login.
    appSession,
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
  ],
});
