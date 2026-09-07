import { Request } from 'express';

/** Safely extract a route param as a string */
export function param(req: Request, name: string): string {
  return req.params[name] as string;
}
