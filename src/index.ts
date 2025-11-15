import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnections } from './config/database';
import modelsRouter from './routes/models.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 헬스 체크 엔드포인트
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 루트 엔드포인트
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Ainus API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

app.use('/api/v1', modelsRouter);

// 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결 테스트
    await testConnections();

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`
========================================
🚀 Ainus API Server 시작
========================================
📡 포트: ${PORT}
🌐 URL: http://localhost:${PORT}
📅 시작 시간: ${new Date().toLocaleString('ko-KR')}
========================================
      `);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();