const app = require('./src/app');
const { initializeGraphCache } = require('./src/services/graphCache');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await initializeGraphCache();
        app.listen(PORT, () => {
            console.log(`🚀 RouteX Server live on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Server startup failed:", err);
        process.exit(1);
    }
}

startServer();

