import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

const bootstrap = async () => {
  try {
    await connectDb();
    app.listen(env.PORT, env.HOST, () => {
      console.log(`Server running on http://${env.HOST}:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void bootstrap();
