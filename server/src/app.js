import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use("/api/tasks", taskRoutes);
app.use(express.urlencoded({ extended: true }));
app.use("/api/ai", aiRoutes);

// Backend Health Check 
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Smart Semantic Task Orchestrator API is running!",
        status: "OK"
    });
});

// Supabase Connection Test
app.get("/api/health/supabase", async (req, res) => {
    try {
        const projectUrl = process.env.SUPABASE_URL.replace(/\/+$/, "");

        const response = await fetch(
            `${projectUrl}/rest/v1/`,
            {
                method: "GET",
                headers: {
                    apikey: process.env.SUPABASE_PUBLISHABLE_KEY,
                    Authorization: `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`,
                    Accept: "application/openapi+json"
                }
            }
        );

        if (!response.ok) {
            const error = await response.text();

            return res.status(500).json({
                success: false,
                message: "Supabase API request failed",
                statusCode: response.status,
                error
            });
        }

        return res.status(200).json({
            success: true,
            message: "Supabase Data API is reachable!",
            status: "CONNECTED"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Connection error",
            error: error.message
        });
    }
});

// Export app
export default app;