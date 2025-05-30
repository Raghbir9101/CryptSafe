import app from "./app";
import dotenv from "dotenv";
import { connectDB } from "./config/database";

dotenv.config();
const PORT = process.env.PORT;

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
});
