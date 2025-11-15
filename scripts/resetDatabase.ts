import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseReset {
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

  async dropAllTables(): Promise<void> {
    console.log('기존 테이블 삭제 중...\n');

    await this.connection!.query('SET FOREIGN_KEY_CHECKS = 0');

    const [tables] = await this.connection!.query('SHOW TABLES');
    const tableList = tables as any[];

    if (tableList.length === 0) {
      console.log('  삭제할 테이블이 없습니다\n');
      return;
    }

    for (const row of tableList) {
      const tableName = Object.values(row)[0] as string;
      await this.connection!.query(`DROP TABLE IF EXISTS ${tableName}`);
      console.log(`  삭제: ${tableName}`);
    }

    await this.connection!.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log(`\n총 ${tableList.length}개 테이블 삭제 완료\n`);
  }

  async createTables(): Promise<void> {
    console.log('새 테이블 생성 중...\n');

    await this.connection!.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      {
        name: 'model_creators',
        sql: `
          CREATE TABLE IF NOT EXISTS model_creators (
            creator_id VARCHAR(36) PRIMARY KEY COMMENT '제공사 ID',
            creator_name VARCHAR(100) NOT NULL COMMENT '제공사 이름',
            creator_slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL 슬러그',
            website_url VARCHAR(255) COMMENT '웹사이트',
            description TEXT COMMENT '설명',
            country VARCHAR(50) COMMENT '국가',
            founded_year YEAR COMMENT '설립연도',
            is_active BOOLEAN DEFAULT TRUE COMMENT '활성 상태',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_creator_slug (creator_slug),
            INDEX idx_is_active (is_active)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'ai_models',
        sql: `
          CREATE TABLE IF NOT EXISTS ai_models (
            model_id VARCHAR(36) PRIMARY KEY COMMENT '모델 ID',
            model_name VARCHAR(150) NOT NULL COMMENT '모델 이름',
            model_slug VARCHAR(150) NOT NULL UNIQUE COMMENT 'URL 슬러그',
            creator_id VARCHAR(36) NOT NULL COMMENT '제공사 ID',
            release_date DATE COMMENT '출시일',
            model_type VARCHAR(50) COMMENT '모델 타입',
            parameter_size VARCHAR(50) COMMENT '파라미터 크기',
            context_length INT COMMENT '컨텍스트 길이',
            is_open_source BOOLEAN DEFAULT FALSE COMMENT '오픈소스 여부',
            is_active BOOLEAN DEFAULT TRUE COMMENT '활성 상태',
            raw_data JSON COMMENT '원본 데이터',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES model_creators(creator_id) ON DELETE CASCADE,
            INDEX idx_model_slug (model_slug),
            INDEX idx_creator_id (creator_id),
            INDEX idx_release_date (release_date),
            INDEX idx_is_active (is_active)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'model_evaluations',
        sql: `
          CREATE TABLE IF NOT EXISTS model_evaluations (
            evaluation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            model_id VARCHAR(36) NOT NULL COMMENT '모델 ID',
            benchmark_name VARCHAR(100) NOT NULL COMMENT '벤치마크 이름',
            score DECIMAL(10,4) COMMENT '점수',
            max_score DECIMAL(10,4) COMMENT '최대 점수',
            normalized_score DECIMAL(5,2) COMMENT '정규화 점수',
            model_rank INT COMMENT '순위',
            measured_at DATE COMMENT '측정일',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (model_id) REFERENCES ai_models(model_id) ON DELETE CASCADE,
            UNIQUE KEY uk_model_benchmark (model_id, benchmark_name),
            INDEX idx_benchmark_name (benchmark_name),
            INDEX idx_normalized_score (normalized_score)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'model_overall_scores',
        sql: `
          CREATE TABLE IF NOT EXISTS model_overall_scores (
            score_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            model_id VARCHAR(36) NOT NULL COMMENT '모델 ID',
            overall_score DECIMAL(5,2) NOT NULL COMMENT '종합 점수',
            intelligence_index DECIMAL(5,2) COMMENT '지능 지수',
            coding_index DECIMAL(5,2) COMMENT '코딩 지수',
            math_index DECIMAL(5,2) COMMENT '수학 지수',
            reasoning_index DECIMAL(5,2) COMMENT '추론 지수',
            language_index DECIMAL(5,2) COMMENT '언어 지수',
            calculated_at DATETIME NOT NULL COMMENT '계산 시점',
            version INT DEFAULT 1 COMMENT '버전',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (model_id) REFERENCES ai_models(model_id) ON DELETE CASCADE,
            INDEX idx_overall_score (overall_score DESC),
            INDEX idx_calculated_at (calculated_at),
            UNIQUE KEY uk_model_version (model_id, version)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'model_pricing',
        sql: `
          CREATE TABLE IF NOT EXISTS model_pricing (
            pricing_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            model_id VARCHAR(36) NOT NULL COMMENT '모델 ID',
            price_input_1m DECIMAL(10,6) COMMENT '입력 토큰 가격',
            price_output_1m DECIMAL(10,6) COMMENT '출력 토큰 가격',
            price_blended_3to1 DECIMAL(10,6) COMMENT '혼합 가격',
            currency VARCHAR(10) DEFAULT 'USD' COMMENT '통화',
            effective_date DATE COMMENT '적용일',
            is_current BOOLEAN DEFAULT TRUE COMMENT '현재 가격',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (model_id) REFERENCES ai_models(model_id) ON DELETE CASCADE,
            INDEX idx_model_id (model_id),
            INDEX idx_is_current (is_current),
            INDEX idx_effective_date (effective_date)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      },
      {
        name: 'model_performance',
        sql: `
          CREATE TABLE IF NOT EXISTS model_performance (
            performance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            model_id VARCHAR(36) NOT NULL COMMENT '모델 ID',
            median_output_tokens_per_second DECIMAL(10,2) COMMENT '초당 출력 토큰',
            median_time_to_first_token DECIMAL(10,4) COMMENT '첫 토큰 시간',
            median_time_to_first_answer DECIMAL(10,4) COMMENT '첫 답변 시간',
            latency_p50 DECIMAL(10,4) COMMENT '지연시간 P50',
            latency_p95 DECIMAL(10,4) COMMENT '지연시간 P95',
            latency_p99 DECIMAL(10,4) COMMENT '지연시간 P99',
            measured_at DATETIME COMMENT '측정 시점',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (model_id) REFERENCES ai_models(model_id) ON DELETE CASCADE,
            INDEX idx_model_id (model_id),
            INDEX idx_measured_at (measured_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `
      }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const table of tables) {
      try {
        await this.connection!.query(table.sql);
        console.log(`  생성: ${table.name}`);
        successCount++;
      } catch (error: any) {
        console.error(`  실패: ${table.name}`);
        if (error.sqlMessage) {
          console.error(`       오류: ${error.sqlMessage.substring(0, 100)}`);
        }
        failCount++;
      }
    }

    await this.connection!.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log(`\n생성 성공: ${successCount}개, 실패: ${failCount}개\n`);

    const [finalTables] = await this.connection!.query('SHOW TABLES');
    const finalList = finalTables as any[];
    
    console.log('최종 테이블 목록:');
    finalList.forEach((row: any, index: number) => {
      console.log(`  ${index + 1}. ${Object.values(row)[0]}`);
    });
    console.log('');
  }

  async verifyTables(): Promise<void> {
    console.log('테이블 검증 중...\n');

    const requiredTables = [
      'model_creators',
      'ai_models', 
      'model_evaluations',
      'model_overall_scores',
      'model_pricing',
      'model_performance'
    ];

    const [tables] = await this.connection!.query('SHOW TABLES');
    const existingTables = (tables as any[]).map(row => Object.values(row)[0]);

    let allExist = true;

    for (const tableName of requiredTables) {
      const exists = existingTables.includes(tableName);
      const status = exists ? '존재' : '누락';
      const icon = exists ? '✓' : '✗';
      
      console.log(`  ${icon} ${tableName.padEnd(30)} ${status}`);
      
      if (!exists) {
        allExist = false;
      }
    }

    console.log('');

    if (allExist) {
      console.log('모든 필수 테이블이 정상적으로 생성되었습니다\n');
    } else {
      console.log('일부 테이블 생성에 실패했습니다\n');
    }
  }

  async reset(): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log('DATABASE RESET');
    console.log('='.repeat(70));
    console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}\n`);

    const startTime = Date.now();

    try {
      await this.connect();
      await this.dropAllTables();
      await this.createTables();
      await this.verifyTables();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('='.repeat(70));
      console.log('DATABASE RESET COMPLETE');
      console.log('='.repeat(70));
      console.log(`종료 시간: ${new Date().toLocaleString('ko-KR')}`);
      console.log(`소요 시간: ${duration}초\n`);

    } catch (error) {
      console.error('\n' + '='.repeat(70));
      console.error('DATABASE RESET FAILED');
      console.error('='.repeat(70));
      console.error('Error:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

if (require.main === module) {
  const resetter = new DatabaseReset();

  console.log('\n경고: 모든 데이터가 삭제됩니다!');
  console.log('계속하려면 5초 기다립니다...\n');

  setTimeout(() => {
    resetter
      .reset()
      .then(() => {
        console.log('데이터베이스 초기화 완료');
        console.log('다음 단계: npm run pipeline:aa\n');
        process.exit(0);
      })
      .catch((error) => {
        console.error('오류:', error);
        process.exit(1);
      });
  }, 5000);
}

export default DatabaseReset;