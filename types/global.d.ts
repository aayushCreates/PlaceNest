import UserType from "./UserTypes";
declare namespace Express {
  export interface Request {
    user?: UserType;
  }
}
