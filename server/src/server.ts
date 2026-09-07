import app from './app';
import { env } from './config/env';
import { slaService } from './services/sla.service';

const start = async () => {
  try {
    // Initialize SLA defaults
    await slaService.initDefaults();

    // Check overdue complaints every 5 minutes
    setInterval(async () => {
      const count = await slaService.checkOverdue();
      if (count > 0) console.log(`[SLA] Marked ${count} complaints as overdue`);
    }, 5 * 60 * 1000);

    app.listen(env.PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`📋 API: http://localhost:${env.PORT}/api`);
      console.log(`💊 Health: http://localhost:${env.PORT}/api/health`);
      console.log(`🌍 Environment: ${env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
