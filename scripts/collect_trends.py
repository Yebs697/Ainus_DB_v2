import sys
import io
import json
from datetime import datetime
from pytrends.request import TrendReq
import os
import time
import random

# UTF-8 인코딩 강제
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def collect_google_trends(keywords):
    """
    Google Trends 데이터 수집
    """
    print(f"Google Trends 수집 시작: {keywords}")
    
    # TrendReq 객체 생성 시 재시도 로직 추가 (권장)
    pytrends = TrendReq(hl='ko', tz=540, retries=3, backoff_factor=0.5) 
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'keywords': keywords,
        'data': {}
    }
    
    try:
        # [딜레이 1] build_payload 요청 전 대기
        wait_time_1 = random.uniform(5, 10) # 5초에서 10초 사이 랜덤 딜레이
        print(f"API 요청 전 {wait_time_1:.2f}초 대기...")
        time.sleep(wait_time_1)
        
        pytrends.build_payload(keywords, timeframe='today 3-m', geo='KR')
        
        # [딜레이 2] 시간별 관심도 요청 전 대기
        wait_time_2 = random.uniform(3, 7) # 3초에서 7초 사이 랜덤 딜레이
        time.sleep(wait_time_2)
        
        # 시간별 관심도
        interest_over_time = pytrends.interest_over_time()
        if not interest_over_time.empty:
            results['data']['interest_over_time'] = interest_over_time.to_dict('records')
            print(f"시간별 관심도: {len(interest_over_time)} 개 데이터")
        
        # [딜레이 3] 지역별 관심도 요청 전 대기
        wait_time_3 = random.uniform(3, 7) # 3초에서 7초 사이 랜덤 딜레이
        time.sleep(wait_time_3)
        
        # 지역별 관심도
        interest_by_region = pytrends.interest_by_region()
        if not interest_by_region.empty:
            results['data']['interest_by_region'] = interest_by_region.to_dict('index')
            print(f"지역별 관심도: {len(interest_by_region)} 개 지역")
        
        # [딜레이 4] 관련 검색어 요청 전 대기 (가장 긴 딜레이 권장)
        wait_time_4 = random.uniform(5, 15) # 5초에서 15초 사이 랜덤 딜레이
        time.sleep(wait_time_4)
        
        # 관련 검색어
        related_queries = pytrends.related_queries()
        results['data']['related_queries'] = {}
        for keyword in keywords:
            if keyword in related_queries:
                results['data']['related_queries'][keyword] = {
                    'top': related_queries[keyword]['top'].to_dict('records') if related_queries[keyword]['top'] is not None else [],
                    'rising': related_queries[keyword]['rising'].to_dict('records') if related_queries[keyword]['rising'] is not None else []
                }
        print(f"관련 검색어 수집 완료")
        
    except Exception as e:
        print(f"오류 발생: {e}")
        results['error'] = str(e)
    
    # 결과 저장
    output_dir = os.path.join(os.getcwd(), 'data', 'raw')
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')
    output_file = os.path.join(output_dir, f'trends_{timestamp}.json')
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    latest_file = os.path.join(output_dir, 'trends_latest.json')
    with open(latest_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"데이터 저장: {output_file}")
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("사용법: python collect_trends.py \"키워드1,키워드2,키워드3\"")
        sys.exit(1)
    
    keywords_str = sys.argv[1]
    keywords = [k.strip() for k in keywords_str.split(',')]
    
    result = collect_google_trends(keywords)
    print(json.dumps(result, ensure_ascii=False, indent=2))