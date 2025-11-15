import { ArtificialAnalysisCollector } from '../services/collectors/artificialAnalysis.collector';
import { NaverCollector } from '../services/collectors/naver.collector';
import { TrendsCollector } from '../services/collectors/trends.collector';

async function testDataCollection() {
  console.log('🧪 데이터 수집 테스트 시작\n');
  console.log('='.repeat(50));
  
  // 1. Artificial Analysis API 테스트
  console.log('\n1️⃣ Artificial Analysis API 테스트');
  console.log('-'.repeat(50));
  try {
    const aaCollector = new ArtificialAnalysisCollector();
    
    // 연결 테스트
    await aaCollector.testConnection();
    
    // 모델 데이터 수집
    const models = await aaCollector.collectModels();
    console.log('📊 수집된 모델 수:', models.models?.length || 0);
    
    // 벤치마크 데이터 수집
    const benchmarks = await aaCollector.collectBenchmarks();
    console.log('📊 벤치마크 데이터 수집 완료');
    
  } catch (error) {
    console.error('❌ Artificial Analysis 테스트 실패:', error);
  }
  
  // 2. Naver API 테스트
  console.log('\n2️⃣ Naver News API 테스트');
  console.log('-'.repeat(50));
  try {
    const naverCollector = new NaverCollector();
    
    // 연결 테스트
    await naverCollector.testConnection();
    
    // AI 뉴스 수집
    const aiNews = await naverCollector.collectAINews({
      query: 'ai',
      display: 8
    });
    console.log('📊 수집된 뉴스:', aiNews.items.length, '개');
    console.log('📰 첫 번째 뉴스:', aiNews.items[0]?.title);
    
    // 여러 키워드로 수집
    const keywords = ['ChatGPT', 'Claude AI', 'Gemini AI', 'ai'];
    const multipleNews = await naverCollector.collectMultipleKeywords(keywords);
    console.log('📊 총 수집 키워드:', multipleNews.size, '개');
    
  } catch (error) {
    console.error('❌ Naver API 테스트 실패:', error);
  }
  
  // 3. Google Trends 테스트
  console.log('\n3️⃣ Google Trends 테스트');
  console.log('-'.repeat(50));
  try {
    const trendsCollector = new TrendsCollector();
    
    // Python 환경 확인
    const isPythonReady = await trendsCollector.checkPythonEnvironment();
    
    if (isPythonReady) {
      // Trends 데이터 수집
      const trends = await trendsCollector.collectTrends([
        //'ChatGPT',
        'Claude',
        //'Gemini',
        'ai'
      ]);
      console.log('📊 Trends 데이터 수집 완료');
    } else {
      console.warn('⚠️ Python 환경 미구성 - Trends 수집 생략');
    }
    
  } catch (error) {
    console.error('❌ Google Trends 테스트 실패:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 테스트 완료!\n');
  console.log('📁 수집된 데이터 위치: data/raw/');
}

// 실행
testDataCollection()
  .then(() => {
    console.log('✅ 모든 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  });