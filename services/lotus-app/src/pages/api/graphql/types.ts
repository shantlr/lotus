import { IncomingMessage, ServerResponse } from 'http';
import { Session } from 'next-auth';

export type GraphqlContext = {
  req: IncomingMessage & { cookies: Record<string, string> };
  res: ServerResponse<IncomingMessage>;
  currentSession: Session;
};
