import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// 503 시 재시도 + 모델 fallback
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite-preview-06-17", "gemini-3-flash-preview"];

async function generateWithRetry(prompt: string): Promise<string> {
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI] 시도 중: ${model} (${attempt}회)`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response.text) {
          console.log(`[AI] 성공: ${model}`);
          return response.text;
        }
      } catch (err: any) {
        const status = err?.status ?? err?.code;
        console.warn(`[AI] ${model} 실패 (${status}):`, err?.message);
        // 503이면 1초 대기 후 재시도, 그 외 에러면 다음 모델로
        if (status === 503 && attempt === 1) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }
  }
  throw new Error("모든 모델 호출 실패");
}

export async function getMovieRecommendation(
  genre: string,
  runningTime: string,
  tempo: string,
  character: string,
  visual: string,
  keywords: string[]
) {
  const prompt = `
당신은 20년 경력의 영화 큐레이터입니다. 아래 취향 데이터를 분석해 영화 3편을 추천해 주세요.

[취향 데이터]
- 장르: ${genre}
- 선호 러닝타임: ${runningTime}
- 영화 템포: ${tempo}
- 인물 유형: ${character}
- 시각적 무드: ${visual}
- 추가 키워드: ${keywords.length > 0 ? keywords.join(", ") : "없음"}

[응답 규칙]
- 반드시 실존하는 영화만 추천
- JSON 배열만 반환, 다른 텍스트 없음
- reason은 위 취향 데이터와 구체적으로 연결해서 2~3문장으로 작성

[응답 형식]
[
  {
    "title": "영화 제목 (한국어 또는 원제)",
    "year": "개봉연도",
    "reason": "이 영화를 추천하는 이유 — 선택한 취향과 구체적으로 연결"
  }
]
`;

  const text = await generateWithRetry(prompt);
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function generateMovieReview(
  movieTitle: string,
  userInput: string,
  keywords: string[],
  style: string
): Promise<{ review: string; score: number }> {
  const styleGuide: Record<string, string> = {
    critic: "씨네21 영화 평론가 스타일 — 영화적 맥락과 감독의 의도를 분석하는 지적이고 절제된 문체",
    emotional: "감성적이고 따뜻한 문체 — 영화가 남긴 여운과 감정의 결을 섬세하게 묘사",
    blog: "블로그 포스팅 스타일 — 독자가 읽기 편한 구어체, 소제목 활용, 스포 없이 추천 이유 중심",
    sns: "인스타그램 캡션 스타일 — 짧고 감각적인 문장, 해시태그 3개 포함, 200자 이내",
  };

  const prompt = `
당신은 전문 영화 비평가입니다. 아래 정보를 바탕으로 영화 리뷰를 작성하고, 감상 반영도를 평가해 주세요.

[영화 제목]
${movieTitle}

[사용자의 실제 감상]
${userInput}

[사용자가 선택한 감정 키워드]
${keywords.length > 0 ? keywords.join(", ") : "없음"}

[요청 문체]
${styleGuide[style] ?? styleGuide.critic}

[작성 규칙]
- 반드시 사용자의 실제 감상과 키워드를 리뷰에 녹여낼 것
- AI가 쓴 느낌이 나지 않도록 자연스럽게 작성
- 스포일러 없이 작성
- 분량: sns 스타일은 200자 이내, 나머지는 300~500자

[감상 반영도 채점 기준 — 0~100점]
- 사용자 감상의 핵심 감정이 리뷰에 살아있는가 (40점)
- 사용자가 언급한 장면·요소·표현이 반영됐는가 (35점)
- 선택한 감정 키워드의 뉘앙스가 자연스럽게 녹아들었는가 (25점)

[응답 형식 — 반드시 아래 JSON만 반환, 다른 텍스트 없음]
{"review":"리뷰 텍스트","score":숫자}
`;

  const raw = await generateWithRetry(prompt);

  // JSON 파싱 시도
  try {
    const cleaned = raw
      .replace(/```json[\s\S]*?```/g, (m) => m.replace(/```json|```/g, ""))
      .replace(/```/g, "")
      .trim();

    // JSON 블록만 추출 (앞뒤 설명 텍스트 제거)
    const jsonMatch = cleaned.match(/\{[\s\S]*"review"[\s\S]*"score"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const review = String(parsed.review ?? "").trim();
      const score = Math.min(Math.max(Math.round(Number(parsed.score)), 0), 100);
      if (review && !isNaN(score)) {
        return { review, score };
      }
    }
  } catch {
    console.warn("[AI] JSON 파싱 실패, 폴백 처리");
  }

  // 폴백 1: score만 정규식으로 추출, review는 전체 텍스트
  const scoreMatch = raw.match(/"score"\s*:\s*(\d+)/);
  if (scoreMatch) {
    const reviewMatch = raw.match(/"review"\s*:\s*"([\s\S]+?)(?<!\\)"/);
    const review = reviewMatch
      ? reviewMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"')
      : raw.replace(/\{[\s\S]*\}/, "").trim() || raw.trim();
    const score = Math.min(Math.max(parseInt(scoreMatch[1]), 0), 100);
    if (review) return { review, score };
  }

  // 폴백 2: JSON 파싱 완전 실패 → 텍스트 전체를 리뷰로, 키워드 방식으로 점수 계산
  const review = raw.trim();
  const matchedCount = keywords.filter((kw) => review.includes(kw.replace("#", ""))).length;
  const total = keywords.length;
  const score = total === 0
    ? 91
    : Math.min(Math.round(70 + (matchedCount / total) * 25 + Math.random() * 5), 99);

  return { review, score };
}