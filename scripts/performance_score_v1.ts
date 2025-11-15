// JSON 데이터 구조를 나타내는 인터페이스
interface ModelData {
  id: string;
  name: string;
  slug: string;
  release_date: string;
  model_creator: {
    id: string;
    name: string;
    slug: string;
  };
  evaluations: {
    artificial_analysis_intelligence_index: number;
    artificial_analysis_coding_index: number;
    artificial_analysis_math_index: number;
    mmlu_pro: number;
    gpqa: number;
    hle: number; // 역정규화 대상
    livecodebench: number;
    scicode: number;
    math_500: number | null;
    aime: number | null;
    aime_25: number;
    ifbench: number;
    lcr: number;
    terminalbench_hard: number;
    tau2: number;
  };
  pricing: {
    price_1m_blended_3_to_1: number;
    price_1m_input_tokens: number;
    price_1m_output_tokens: number;
  };
  median_output_tokens_per_second: number;
  median_time_to_first_token_seconds: number;
  median_time_to_first_answer_token: number;
}

// 최종 성능 결과 인터페이스
interface ModelPerformanceResult {
  name: string;
  id: string;
  performance_score: number;
  weighted_scores: { [key: string]: number };
}

// 지표별 가중치 및 최대값 설정
const WEIGHTS_AND_MAX_SCORES = {
  // 핵심 능력 (총 0.55)
  artificial_analysis_intelligence_index: { weight: 0.25, max: 100, type: 'normal' },
  artificial_analysis_coding_index: { weight: 0.15, max: 100, type: 'normal' },
  artificial_analysis_math_index: { weight: 0.15, max: 100, type: 'normal' },

  // 지식 및 실용성 (총 0.35)
  mmlu_pro: { weight: 0.10, max: 1.0, type: 'normal' },
  gpqa: { weight: 0.08, max: 1.0, type: 'normal' },
  livecodebench: { weight: 0.07, max: 1.0, type: 'normal' },
  lcr: { weight: 0.05, max: 1.0, type: 'normal' },
  tau2: { weight: 0.05, max: 1.0, type: 'normal' },
  
  // 안전성 및 특수 능력 (총 0.10)
  hle: { weight: 0.04, max: 1.0, type: 'inverse' }, // 역정규화
  aime_25: { weight: 0.03, max: 1.0, type: 'normal' },
  scicode: { weight: 0.02, max: 1.0, type: 'normal' },
  terminalbench_hard: { weight: 0.01, max: 1.0, type: 'normal' },
  
  // 가중치에 포함되지 않는 지표 (ifbench 등)는 아래 로직에서 자동으로 제외됨.
};

/**
 * 모델의 종합 성능 점수를 계산하는 함수
 * @param modelData 단일 모델의 JSON 데이터 객체
 * @returns ModelPerformanceResult 객체 (이름, ID, 최종 점수, 가중치 점수)
 */
function calculatePerformanceScore(modelData: ModelData): ModelPerformanceResult {
  let totalWeightedScore = 0;
  const weightedScores: { [key: string]: number } = {};

  const evaluations = modelData.evaluations;

  for (const key in WEIGHTS_AND_MAX_SCORES) {
    const config = WEIGHTS_AND_MAX_SCORES[key as keyof typeof WEIGHTS_AND_MAX_SCORES];
    
    // 가중치가 부여된 지표의 값을 가져옵니다.
    const score = evaluations[key as keyof typeof evaluations];

    if (score === null || score === undefined) {
        // 데이터가 없는 지표는 0으로 간주하고 경고를 출력합니다.
        console.warn(`Warning: Score for ${key} in ${modelData.name} is null/undefined. Treating as 0.`);
        continue; 
    }

    let normalizedScore: number;
    
    // 1. 정규화 및 역정규화
    if (config.type === 'inverse') {
      // HLE (Harmful Language Evasion)의 경우: 낮을수록 좋으므로 1에서 점수를 뺌 (역정규화)
      normalizedScore = 1.0 - (score / config.max);
    } else {
      // 일반 지표의 경우: 높을수록 좋으므로 최대값으로 나눔 (정규화)
      normalizedScore = score / config.max;
    }

    // 2. 가중치 적용
    const weightedScore = normalizedScore * config.weight;
    
    totalWeightedScore += weightedScore;
    weightedScores[key] = weightedScore;
  }

  // 3. 최종 점수 계산 (100점 만점)
  const performance_score = totalWeightedScore * 100;

  return {
    name: modelData.name,
    id: modelData.id,
    performance_score: parseFloat(performance_score.toFixed(2)), // 소수점 둘째 자리까지 반올림
    weighted_scores: weightedScores,
  };
}

// ----------------------------------------------------------------
// --- 테스트 데이터 및 실행 로직 ---
// ----------------------------------------------------------------

const modelDataArray: ModelData[] = [
    {
        "id": "05e45a36-b5c6-47a1-8adb-9ddc19add5b3",
        "name": "GPT-5 nano (minimal)",
        "slug": "gpt-5-nano-minimal",
        "release_date": "2025-08-07",
        "model_creator": { "id": "e67e56e3-15cd-43db-b679-da4660a69f41", "name": "OpenAI", "slug": "openai" },
        "evaluations": {
            "artificial_analysis_intelligence_index": 29.1, "artificial_analysis_coding_index": 27.5,
            "artificial_analysis_math_index": 27.3, "mmlu_pro": 0.556, "gpqa": 0.428, "hle": 0.041,
            "livecodebench": 0.47, "scicode": 0.291, "math_500": null, "aime": null, "aime_25": 0.273,
            "ifbench": 0.325, "lcr": 0.2, "terminalbench_hard": 0.064, "tau2": 0.257
        },
        "pricing": { "price_1m_blended_3_to_1": 0.138, "price_1m_input_tokens": 0.05, "price_1m_output_tokens": 0.4 },
        "median_output_tokens_per_second": 0, "median_time_to_first_token_seconds": 0, "median_time_to_first_answer_token": 0
    },
    {
        "id": "16149b9c-a1e9-4669-a5cb-ff3c00d78f89",
        "name": "gpt-oss-20B (low)",
        "slug": "gpt-oss-20b-low",
        "release_date": "2025-08-05",
        "model_creator": { "id": "e67e56e3-15cd-43db-b679-da4660a69f41", "name": "OpenAI", "slug": "openai" },
        "evaluations": {
            "artificial_analysis_intelligence_index": 44.3, "artificial_analysis_coding_index": 34.5,
            "artificial_analysis_math_index": 62.3, "mmlu_pro": 0.718, "gpqa": 0.611, "hle": 0.051,
            "livecodebench": 0.652, "scicode": 0.34, "math_500": null, "aime": null, "aime_25": 0.623,
            "ifbench": 0.578, "lcr": 0.31, "terminalbench_hard": 0.043, "tau2": 0.503
        },
        "pricing": { "price_1m_blended_3_to_1": 0.094, "price_1m_input_tokens": 0.06, "price_1m_output_tokens": 0.2 },
        "median_output_tokens_per_second": 284.303, "median_time_to_first_token_seconds": 0.415, "median_time_to_first_answer_token": 7.45
    }
];

const results = modelDataArray.map(calculatePerformanceScore);
console.log(JSON.stringify(results, null, 2));