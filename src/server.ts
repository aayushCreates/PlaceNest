import express from 'express';
import {Request, Response, NextFunction} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/error.middleware'
import authRouter from './routes/auth.routes';


const app = express();
dotenv.config();

app.use(cors({
    origin: [ 'http://localhost:3030' ]
}));
app.use(express.json());
app.use(cookieParser());


app.use('/auth/register', authRouter);
// app.use('/profile');

app.use('/ping', (req: Request, res: Response, next: NextFunction)=> {
    res.send("hello world");
})

app.use(errorMiddleware)

const port = process.env.PORT || 5050;
app.listen(port, ()=> {
    console.log("✅ server is running on port: " + port);
})





