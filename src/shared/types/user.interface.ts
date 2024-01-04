/* eslint-disable prettier/prettier */

import { Request } from "express";
export class User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "student" | "lecturer";
}

export interface CustomRequest extends Request {
  user: User;
}
