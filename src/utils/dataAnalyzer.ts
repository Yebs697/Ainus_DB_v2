import * as fs from 'fs';
import * as path from 'path';

export class DataAnalyzer {
  private dataDir = path.join(process.cwd(), 'data', 'raw');

  /**
   * Artificial Analysis 데이터 구조 분석
   */
  analyzeArtificialAnalysis(): void {
    console.log('📊 Artificial Analysis 데이터 분석\n');
    console.log('='.repeat(60));
    
    // 최신 파일 찾기
    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('artificial_analysis_models_'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('❌ 파일 없음');
      return;
    }
    
    const latestFile = files[0];
    console.log(`📁 파일: ${latestFile}\n`);
    
    const filepath = path.join(this.dataDir, latestFile);
    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content);
    
    console.log('전체 구조:');
    console.log(`  - 키: ${Object.keys(data).join(', ')}\n`);
    
    if (data.data && Array.isArray(data.data)) {
      console.log(`모델 개수: ${data.data.length}\n`);
      
      const sample = data.data[0];
      console.log('첫 번째 모델 필드:');
      Object.keys(sample).forEach(key => {
        const value = sample[key];
        const type = Array.isArray(value) 
          ? `Array(${value.length})`
          : typeof value;
        console.log(`  - ${key}: ${type}`);
      });
      
      console.log('\n샘플 데이터:');
      console.log(JSON.stringify(sample, null, 2).substring(0, 1500));
      console.log('...\n');
    }
    
    console.log('='.repeat(60));
  }

  /**
   * Naver News 데이터 구조 분석
   */
  analyzeNaverNews(): void {
    console.log('\n📰 Naver News 데이터 분석\n');
    console.log('='.repeat(60));
    
    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('naver_news_'));
    
    console.log(`📁 파일 개수: ${files.length}\n`);
    
    if (files.length === 0) {
      console.log('❌ 파일 없음');
      return;
    }
    
    // 첫 번째 파일 분석
    const firstFile = files[0];
    console.log(`📁 분석 파일: ${firstFile}\n`);
    
    const filepath = path.join(this.dataDir, firstFile);
    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content);
    
    console.log(`총 뉴스: ${data.total}개`);
    console.log(`수집된 뉴스: ${data.items.length}개\n`);
    
    if (data.items && data.items.length > 0) {
      const sample = data.items[0];
      
      console.log('뉴스 데이터 필드:');
      Object.keys(sample).forEach(key => {
        console.log(`  - ${key}: ${typeof sample[key]}`);
      });
      
      console.log('\n샘플 뉴스:');
      console.log(JSON.stringify(sample, null, 2));
      console.log('\n');
    }
    
    console.log('='.repeat(60));
  }

  /**
   * 전체 분석 실행
   */
  analyzeAll(): void {
    this.analyzeArtificialAnalysis();
    this.analyzeNaverNews();
    
    console.log('\n💡 다음 단계:');
    console.log('   1. 위 데이터 구조를 기반으로 DB 스키마 설계');
    console.log('   2. 데이터 정제 로직 구현');
    console.log('   3. MySQL 테이블 생성\n');
  }
}

// 실행
if (require.main === module) {
  const analyzer = new DataAnalyzer();
  analyzer.analyzeAll();
}