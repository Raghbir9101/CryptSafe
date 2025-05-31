import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = `${process.env.MONGO_URI}` || "";
const MONGO_URI_1 = `${process.env.MONGO_URI_1}` || "";

export const conn1 = mongoose.createConnection(MONGO_URI);
export const conn2 = mongoose.createConnection(MONGO_URI_1);

export const connectDB = async () => {
    try {
    const connect=    await mongoose.connect(MONGO_URI);
        // await Promise.all([conn1.asPromise(), conn2.asPromise()]);
        console.log("Connected to MongoDB" + connect.connection.host);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
 