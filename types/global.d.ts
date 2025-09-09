
import { User } from '../src/generated/prisma/index'

declare module 'express-serve-static-core' {
    interface Request {
        user?: User
    }
}
