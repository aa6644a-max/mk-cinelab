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
) {
  const styleGuide: Record<string, string> = {
    critic: "씨네21 영화 평론가 스타일 — 영화적 맥락과 감독의 의도를 분석하는 지적이고 절제된 문체",
    emotional: "감성적이고 따뜻한 문체 — 영화가 남긴 여운과 감정의 결을 섬세하게 묘사",
    blog: "블로그 포스팅 스타일 — 독자가 읽기 편한 구어체, 소제목 활용, 스포 없이 추천 이유 중심",
    sns: "인스타그램 캡션 스타일 — 짧고 감각적인 문장, 해시태그 3개 포함, 200자 이내",
  };

  const prompt = `
당신은 전문 영화 비평가입니다. 아래 정보를 바탕으로 영화 리뷰를 작성해 주세요.

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
- 순수 리뷰 텍스트만 반환 (JSON 형식 아님)
- 분량: sns 스타일은 200자 이내, 나머지는 300~500자
`;

  const text = await generateWithRetry(prompt);
  return text.trim();
}