import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseChecker {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3307'),
        user: process.env.DB_USER || 'ainus_user',
        password: process.env.DB_PASSWORD || 'qwer1234',
        database: process.env.DB_NAME || 'ai_model_app',
      });
      console.log('MySQL 연결 성공\n');
    } catch (error) {
      console.error('MySQL 연결 실패:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('\nMySQL 연결 종료');
    }
  }

  async listDatabases(): Promise<void> {
    console.log('='.repeat(70));
    console.log('데이터베이스 목록');
    console.log('='.repeat(70));

    const [rows] = await this.connection!.query('SHOW DATABASES');
    (rows as any[]).forEach((row: any) => {
      console.log(`  - ${Object.values(row)[0]}`);
    });
  }

  async listTables(): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log('테이블 목록');
    console.log('='.repeat(70));

    const [rows] = await this.connection!.query('SHOW TABLES');
    const tables = rows as any[];
    
    if (tables.length === 0) {
      console.log('  테이블이 없습니다');
      return;
    }

    console.log(`  총 ${tables.length}개 테이블:\n`);
    tables.forEach((row: any, index: number) => {
      console.log(`  ${index + 1}. ${Object.values(row)[0]}`);
    });
  }

  async describeTable(tableName: string): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log(`테이블 구조: ${tableName}`);
    console.log('='.repeat(70));

    try {
      const [rows] = await this.connection!.query(`DESCRIBE ${tableName}`);
      const columns = rows as any[];

      console.log(`\n총 ${columns.length}개 컬럼:\n`);
      console.log('컬럼명'.padEnd(30) + '타입'.padEnd(20) + 'NULL 허용'.padEnd(10) + '키'.padEnd(10) + '기본값');
      console.log('-'.repeat(70));

      columns.forEach((col: any) => {
        console.log(
          (col.Field || '').padEnd(30) +
          (col.Type || '').padEnd(20) +
          (col.Null || '').padEnd(10) +
          (col.Key || '').padEnd(10) +
          (col.Default || 'NULL')
        );
      });
    } catch (error) {
      console.error(`테이블 ${tableName}을 찾을 수 없습니다`);
    }
  }

  async countRecords(): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log('테이블별 레코드 개수');
    console.log('='.repeat(70) + '\n');

    const [tables] = await this.connection!.query('SHOW TABLES');
    const tableList = tables as any[];

    if (tableList.length === 0) {
      console.log('  테이블이 없습니다');
      return;
    }

    for (const row of tableList) {
      const tableName = Object.values(row)[0] as string;
      try {
        const [countResult] = await this.connection!.query(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        const count = (countResult as any[])[0].count;
        console.log(`  ${tableName.padEnd(30)} ${count.toLocaleString()}개`);
      } catch (error) {
        console.log(`  ${tableName.padEnd(30)} 오류 발생`);
      }
    }
  }

  async showModelSample(): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log('AI 모델 샘플 (상위 5개)');
    console.log('='.repeat(70) + '\n');

    try {
      const [rows] = await this.connection!.query(`
        SELECT 
          m.model_id,
          m.model_name,
          mc.creator_name,
          m.release_date,
          m.is_active
        FROM ai_models m
        LEFT JOIN model_creators mc ON m.creator_id = mc.creator_id
        ORDER BY m.created_at DESC
        LIMIT 5
      `);

      const models = rows as any[];
      
      if (models.length === 0) {
        console.log('  모델 데이터가 없습니다');
        return;
      }

      models.forEach((model: any, index: number) => {
        console.log(`${index + 1}. ${model.model_name}`);
        console.log(`   제공사: ${model.creator_name || 'N/A'}`);
        console.log(`   출시일: ${model.release_date || 'N/A'}`);
        console.log(`   활성: ${model.is_active ? 'Yes' : 'No'}`);
        console.log('');
      });
    } catch (error) {
      console.log('  ai_models 테이블이 없습니다');
    }
  }

  /**
   * 점수 상위 모델 조회 (수정됨)
   */
  async showTopModels(): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log('종합 점수 상위 10개 모델');
    console.log('='.repeat(70) + '\n');

    try {
      // LIMIT를 직접 쿼리에 포함
      const [rows] = await this.connection!.query(`
        SELECT 
          m.model_name,
          mc.creator_name,
          s.overall_score,
          s.intelligence_index,
          s.coding_index,
          s.math_index
        FROM model_overall_scores s
        JOIN ai_models m ON s.model_id = m.model_id
        JOIN model_creators mc ON m.creator_id = mc.creator_id
        WHERE s.version = (
          SELECT MAX(version) 
          FROM model_overall_scores 
          WHERE model_id = s.model_id
        )
        ORDER BY s.overall_score DESC
        LIMIT 10
      `);

      const models = rows as any[];
      
      if (models.length === 0) {
        console.log('  점수 데이터가 없습니다');
        return;
      }

      console.log('순위  모델명                            제공사         종합    지능    코딩    수학');
      console.log('-'.repeat(70));

      models.forEach((model: any, index: number) => {
        const rank = (index + 1).toString().padEnd(6);
        const name = (model.model_name || '').substring(0, 30).padEnd(32);
        const creator = (model.creator_name || '').substring(0, 12).padEnd(14);
        const overall = Number(model.overall_score || 0).toFixed(1).padStart(6);
        const intel = Number(model.intelligence_index || 0).toFixed(1).padStart(6);
        const coding = Number(model.coding_index || 0).toFixed(1).padStart(6);
        const math = Number(model.math_index || 0).toFixed(1).padStart(6);

        console.log(`${rank}${name}${creator}${overall}${intel}${coding}${math}`);
      });
    } catch (error: any) {
      console.log('  점수 테이블 조회 오류:', error.message);
    }
  }

  async testConnection(): Promise<void> {
    console.log('='.repeat(70));
    console.log('MySQL 연결 테스트');
    console.log('='.repeat(70) + '\n');

    try {
      const [rows] = await this.connection!.query('SELECT VERSION() as version');
      const version = (rows as any[])[0].version;
      
      console.log('연결 성공!');
      console.log(`   MySQL 버전: ${version}`);
      console.log(`   호스트: ${process.env.DB_HOST || 'localhost'}`);
      console.log(`   포트: ${process.env.DB_PORT || '3307'}`);
      console.log(`   데이터베이스: ${process.env.DB_NAME || 'ai_model_app'}`);
      console.log(`   사용자: ${process.env.DB_USER || 'ainus_user'}`);
    } catch (error) {
      console.error('연결 실패:', error);
      throw error;
    }
  }

  async checkAll(): Promise<void> {
    console.log('\n');
    console.log('╔' + '═'.repeat(68) + '╗');
    console.log('║' + ' DATABASE STATUS CHECK '.padStart(45).padEnd(68) + '║');
    console.log('╚' + '═'.repeat(68) + '╝');
    console.log(`시간: ${new Date().toLocaleString('ko-KR')}\n`);

    await this.testConnection();
    await this.listDatabases();
    await this.listTables();
    await this.countRecords();
    await this.showModelSample();
    await this.showTopModels();

    console.log('\n' + '='.repeat(70));
    console.log('데이터베이스 상태 확인 완료');
    console.log('='.repeat(70) + '\n');
  }
}

if (require.main === module) {
  const checker = new DatabaseChecker();

  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];

  checker
    .connect()
    .then(async () => {
      switch (command) {
        case 'tables':
          await checker.listTables();
          break;
        case 'describe':
          if (param) {
            await checker.describeTable(param);
          } else {
            console.log('사용법: npm run db:check describe <테이블명>');
          }
          break;
        case 'count':
          await checker.countRecords();
          break;
        case 'models':
          await checker.showModelSample();
          break;
        case 'top':
          await checker.showTopModels();
          break;
        case 'test':
          await checker.testConnection();
          break;
        default:
          await checker.checkAll();
      }
      await checker.disconnect();
      process.exit(0);
    })
    .catch((error) => {
      console.error('오류 발생:', error);
      process.exit(1);
    });
}

export default DatabaseChecker;