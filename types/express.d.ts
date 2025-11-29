import 'express';

declare module 'express' {
  interface User {
    id: number;
    email: string;
    name: string;
    age: number;
    roles: string[];
    iat?: number;
    exp?: number;
  }
}
