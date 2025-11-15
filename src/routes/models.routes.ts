import express, { Router, Request, Response } from 'express';
import { mysqlPool } from '../config/database';

const router: Router = express.Router();

// AI 모델 목록 조회
router.get('/models', async (req: Request, res: Response) => {
  try {
    const [rows] = await mysqlPool.query(
      `SELECT 
        model_id, 
        model_name, 
        series_name, 
        developer, 
        overall_score,
        created_at
      FROM ai_models 
      ORDER BY created_at DESC 
      LIMIT 10`
    );

    res.json({
      success: true,
      data: rows,
      count: (rows as any[]).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 모델 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '서버 오류가 발생했습니다',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// 특정 모델 상세 조회
router.get('/models/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await mysqlPool.query(
      `SELECT * FROM ai_models WHERE model_id = ?`,
      [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: `모델을 찾을 수 없습니다 (ID: ${id})`,
          code: 'MODEL_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: (rows as any[])[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 모델 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '서버 오류가 발생했습니다',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// 모델 버전 목록 조회
router.get('/models/:id/versions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await mysqlPool.query(
      `SELECT 
        version_id,
        version_name,
        release_date,
        overall_score,
        created_at
      FROM model_versions 
      WHERE model_id = ? 
      ORDER BY release_date DESC`,
      [id]
    );

    res.json({
      success: true,
      data: rows,
      count: (rows as any[]).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 모델 버전 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '서버 오류가 발생했습니다',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

export default router;