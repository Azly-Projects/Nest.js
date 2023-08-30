declare namespace Express {
  interface Request {
    uid: string;
    user: number | string;
  }
}
