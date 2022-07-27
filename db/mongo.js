import { MongoClient } from "mongodb";

const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`;
console.info(url);
export const mongoDbClient = new MongoClient(url);
