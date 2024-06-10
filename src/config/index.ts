import { str, cleanEnv, port } from 'envalid';
import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "dev"}` });

export const configs = cleanEnv(process.env, { 
    DATABASE_URL: str(),
})
