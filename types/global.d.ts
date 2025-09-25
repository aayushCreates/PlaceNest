import UserType from "./UserTypes";

declare module "next" {
  interface NextApiRequest {
    user?: UserType;
  }
}
