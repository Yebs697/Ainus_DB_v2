import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseInitializer {
  private mysqlConnection: mysql.Connection | null = null;
  private esClient: Client;

  constructor() {
    this.esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
    });
  }

  async initMySQL(): Promise<void> {
    console.log('\n='.repeat(60));
    console.log('MySQL 데이터베이스 초기화');
    console.log('='.repeat(60));

    try {
      // MySQL 연결
      this.mysqlConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3307'),
        user: process.env.DB_USER || 'ainus_user',
        password: process.env.DB_PASSWORD || 'qwer1234',
        database: process.env.DB_NAME || 'ai_model_app',
        multipleStatements: true
      });

      console.log('MySQL 연결 성공');

      // SQL 파일 실행
      const sqlFile = path.join(
        process.cwd(),
        'database',
        'migrations',
        '001_create_core_tables.sql'
      );

      if (!fs.existsSync(sqlFile)) {
        throw new Error(`SQL 파일을 찾을 수 없습니다: ${sqlFile}`);
      }

      const sql = fs.readFileSync(sqlFile, 'utf-8');
      
      console.log('\nSQL 파일 실행 중...');
      await this.mysqlConnection.query(sql);
      console.log('테이블 생성 완료');

      // 테이블 목록 확인
      const [tables] = await this.mysqlConnection.query('SHOW TABLES');
      console.log(`\n생성된 테이블 (${(tables as any[]).length}개):`);
      (tables as any[]).forEach((table: any) => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });

      await this.mysqlConnection.end();
      console.log('\nMySQL 초기화 완료');

    } catch (error) {
      console.error('MySQL 초기화 실패:', error);
      throw error;
    }
  }

  async initElasticsearch(): Promise<void> {
    console.log('\n='.repeat(60));
    console.log('Elasticsearch 인덱스 초기화');
    console.log('='.repeat(60));

    try {
      // 연결 테스트
      const health = await this.esClient.cluster.health();
      console.log('Elasticsearch 연결 성공');
      console.log(`클러스터 상태: ${health.status}`);

      // 1. 뉴스 인덱스 생성
      await this.createNewsIndex();

      // 2. 트렌드 인덱스 생성
      await this.createTrendsIndex();

      console.log('\nElasticsearch 초기화 완료');

    } catch (error) {
      console.error('Elasticsearch 초기화 실패:', error);
      throw error;
    }
  }

  private async createNewsIndex(): Promise<void> {
    const indexName = 'ai_news';
    
    try {
      // 인덱스 존재 확인
      const exists = await this.esClient.indices.exists({ index: indexName });

      if (exists) {
        console.log(`\n인덱스 "${indexName}" 이미 존재 - 삭제 후 재생성`);
        await this.esClient.indices.delete({ index: indexName });
      }

      // 매핑 파일 읽기
      const mappingFile = path.join(
        process.cwd(),
        'database',
        'elasticsearch',
        'mappings',
        'news_index.json'
      );

      const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));

      // 인덱스 생성
      await this.esClient.indices.create({
        index: indexName,
        body: mapping
      });

      console.log(`인덱스 "${indexName}" 생성 완료`);

    } catch (error) {
      console.error(`인덱스 "${indexName}" 생성 실패:`, error);
      throw error;
    }
  }

  private async createTrendsIndex(): Promise<void> {
    const indexName = 'ai_trends';
    
    try {
      // 인덱스 존재 확인
      const exists = await this.esClient.indices.exists({ index: indexName });

      if (exists) {
        console.log(`\n인덱스 "${indexName}" 이미 존재 - 삭제 후 재생성`);
        await this.esClient.indices.delete({ index: indexName });
      }

      // 매핑 파일 읽기
      const mappingFile = path.join(
        process.cwd(),
        'database',
        'elasticsearch',
        'mappings',
        'trends_index.json'
      );

      const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));

      // 인덱스 생성
      await this.esClient.indices.create({
        index: indexName,
        body: mapping
      });

      console.log(`인덱스 "${indexName}" 생성 완료`);

    } catch (error) {
      console.error(`인덱스 "${indexName}" 생성 실패:`, error);
      throw error;
    }
  }

  async run(): Promise<void> {
    const startTime = Date.now();
    
    console.log('\n');
    console.log('DATABASE INITIALIZATION START');
    console.log(`Time: ${new Date().toLocaleString('ko-KR')}`);
    console.log('');

    try {
      // 1. MySQL 초기화
      await this.initMySQL();

      // 2. Elasticsearch 초기화
      await this.initElasticsearch();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log('\n' + '='.repeat(60));
      console.log('DATABASE INITIALIZATION COMPLETE');
      console.log('='.repeat(60));
      console.log(`Total time: ${duration} seconds`);
      console.log('');

    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('DATABASE INITIALIZATION FAILED');
      console.error('='.repeat(60));
      console.error('Error:', error);
      process.exit(1);
    }
  }
}

// 실행
if (require.main === module) {
  const initializer = new DatabaseInitializer();
  initializer.run()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default DatabaseInitializer;