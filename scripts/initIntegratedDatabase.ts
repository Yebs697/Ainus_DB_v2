import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class IntegratedDatabaseInitializer {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      user: process.env.DB_USER || 'ainus_user',
      password: process.env.DB_PASSWORD || 'qwer1234',
      database: process.env.DB_NAME || 'ai_model_app',
      multipleStatements: true
    });
    console.log('MySQL 연결 성공\n');
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('\nMySQL 연결 종료');
    }
  }

  async executeSQL(sql: string): Promise<void> {
    if (!this.connection) await this.connect();
    await this.connection!.query(sql);
  }

  async loadSchemaFromFile(): Promise<string> {
    const sqlFile = path.join(
      process.cwd(),
      'database',
      'migrations',
      'integrated_schema.sql'
    );

    if (fs.existsSync(sqlFile)) {
      return fs.readFileSync(sqlFile, 'utf-8');
    }

    throw new Error(`SQL 파일을 찾을 수 없습니다: ${sqlFile}`);
  }

  async createAllTables(): Promise<void> {
    console.log('통합 스키마 생성 중...\n');

    const sql = await this.loadSchemaFromFile();
    
    await this.executeSQL(sql);

    console.log('✓ 통합 스키마 생성 완료\n');
  }

  async verifyTables(): Promise<void> {
    console.log('테이블 검증 중...\n');

    const [tables] = await this.connection!.query('SHOW TABLES');
    const tableList = (tables as any[]).map(row => Object.values(row)[0]);

    const expectedTables = [
      // 직업
      'job_categories',
      'job_occupations',
      // 사용자
      'users',
      'user_profiles',
      'user_sessions',
      // AI 모델 (기존)
      'model_creators',
      'ai_models',
      'model_evaluations',
      'model_overall_scores',
      'model_pricing',
      'model_performance',
      // 모델 업데이트
      'model_updates',
      'model_updates_details',
      // AI 이슈
      'ai_categories',
      'issue_index_daily',
      'issue_index_by_category',
      // 뉴스 & 태그
      'interest_tags',
      'news_articles',
      'article_to_tags',
      // 커뮤니티
      'community_posts',
      'community_comments',
      'post_likes',
      'community_post_tags',
      // 사용자 관심
      'user_interested_models',
      'user_interest_tags',
      'user_push_notifications',
      'fcm_tokens',
      // 매핑 & 캐시
      'job_occupation_to_tasks',
      'model_comparison_cache',
      // 로그
      'data_collection_logs'
    ];

    console.log(`총 ${tableList.length}개 테이블 생성됨:\n`);

    for (const tableName of expectedTables) {
      const exists = tableList.includes(tableName);
      const status = exists ? '✓' : '✗';
      const color = exists ? '' : ' (누락)';
      console.log(`  ${status} ${tableName}${color}`);
    }

    console.log('');

    const missingTables = expectedTables.filter(t => !tableList.includes(t));
    if (missingTables.length > 0) {
      console.warn(`경고: ${missingTables.length}개 테이블 누락`);
    } else {
      console.log('모든 테이블이 정상적으로 생성되었습니다');
    }
  }

  async getTableStats(): Promise<void> {
    console.log('\n테이블별 레코드 개수:\n');

    const [tables] = await this.connection!.query('SHOW TABLES');
    const tableList = (tables as any[]).map(row => Object.values(row)[0] as string);

    for (const tableName of tableList) {
      try {
        const [result] = await this.connection!.query(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        const count = (result as any[])[0].count;
        console.log(`  ${tableName.padEnd(35)} ${count.toLocaleString()}개`);
      } catch (error) {
        console.log(`  ${tableName.padEnd(35)} 오류`);
      }
    }
  }

  async run(): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log('INTEGRATED DATABASE INITIALIZATION');
    console.log('='.repeat(70));
    console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);

    const startTime = Date.now();

    try {
      await this.connect();
      await this.createAllTables();
      await this.verifyTables();
      await this.getTableStats();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n' + '='.repeat(70));
      console.log('DATABASE INITIALIZATION COMPLETE');
      console.log('='.repeat(70));
      console.log(`종료 시간: ${new Date().toLocaleString('ko-KR')}`);
      console.log(`소요 시간: ${duration}초\n`);

    } catch (error) {
      console.error('\n' + '='.repeat(70));
      console.error('DATABASE INITIALIZATION FAILED');
      console.error('='.repeat(70));
      console.error('Error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

if (require.main === module) {
  const initializer = new IntegratedDatabaseInitializer();

  initializer
    .run()
    .then(() => {
      console.log('완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('치명적 오류:', error);
      process.exit(1);
    });
}

export default IntegratedDatabaseInitializer;