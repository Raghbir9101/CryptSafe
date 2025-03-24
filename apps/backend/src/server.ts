import app from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const PORT = process.env.PORT;
const MONGO_URI = `${process.env.MONGO_URI}` || "";

app.listen(PORT, async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
});
