import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  GEMINI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// API endpoint - 서버에서 API 키 관리 (클라이언트에 노출 안됨)
app.post('/api/generate', async (c) => {
  try {
    const { prompt } = await c.req.json()
    
    // 서버 환경변수에서 API 키 가져오기
    const apiKey = c.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return c.json({ error: '서버 설정 오류입니다. 관리자에게 문의하세요.' }, 500)
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    
    const payload = {
      contents: [{ 
        role: "user", 
        parts: [{ text: prompt }] 
      }],
      generationConfig: { 
        responseMimeType: "application/json" 
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Gemini API Error:', errorData)
      throw new Error('AI 서비스 오류')
    }

    const result = await response.json()
    
    if (result.candidates && result.candidates.length > 0) {
      const text = result.candidates[0].content.parts[0].text
      const parsedResult = JSON.parse(text)
      return c.json(parsedResult)
    } else {
      throw new Error("AI가 응답을 생성하지 못했습니다.")
    }

  } catch (error) {
    console.error('Error:', error)
    return c.json({ error: '메시지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' }, 500)
  }
})

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'XIVIX 후킹메세지 생성기가 실행 중입니다.' })
})

// Main HTML
const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>XIΛIX_후킹메세지 생성기 Step_01</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; }
        
        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #FFF7F5;
            color: #333333;
            word-break: keep-all;
            margin: 0;
            min-height: 100vh;
            font-size: 17px;
            line-height: 1.65;
            letter-spacing: -0.02em;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
        }
        
        .content-wrapper {
            width: 100%;
            max-width: 100%;
            padding: 20px 16px;
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        
        @media (min-width: 769px) {
            body { font-size: 16px; line-height: 1.55; letter-spacing: -0.01em; }
            .content-wrapper { max-width: 720px; margin: 0 auto; padding: 40px; }
        }
        
        .header-section { text-align: center; margin-bottom: 24px; }
        .main-title { font-size: 1.75rem; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
        .main-title .brand { color: #ff7e5f; }
        .sub-title { font-size: 0.95rem; color: #666; line-height: 1.5; }
        
        .card {
            background: white;
            border-radius: 20px;
            padding: 24px 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border: 1px solid #FFE4E1;
        }
        
        .step-label { display: flex; align-items: center; gap: 8px; font-weight: 700; margin-bottom: 12px; }
        .step-number {
            width: 24px; height: 24px;
            background: linear-gradient(135deg, #ff7e5f, #ff6b6b);
            color: white; font-size: 0.8rem; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
        }
        
        .channel-radio { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .channel-radio input { display: none; }
        .channel-radio label {
            padding: 12px 8px; background: #f8f9fa; border: 2px solid #e9ecef;
            border-radius: 12px; cursor: pointer; text-align: center;
            font-weight: 500; transition: all 0.2s;
        }
        .channel-radio input:checked + label {
            background: linear-gradient(135deg, #ff7e5f, #ff6b6b);
            color: white; border-color: transparent;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        @media (min-width: 769px) { .channel-radio { grid-template-columns: repeat(4, 1fr); } }
        
        .input-textarea {
            width: 100%; padding: 16px; border: 2px solid #e9ecef;
            border-radius: 12px; font-size: 1rem; resize: none;
            background: #f8f9fa; font-family: inherit;
            -webkit-user-select: text; user-select: text;
        }
        .input-textarea:focus {
            outline: none; border-color: #ff7e5f; background: white;
            box-shadow: 0 0 0 4px rgba(255, 126, 95, 0.1);
        }
        
        .btn-primary {
            width: 100%;
            background: linear-gradient(135deg, #ff7e5f, #ff6b6b);
            color: white; font-weight: 700; font-size: 1.1rem;
            padding: 16px 24px; border: none; border-radius: 14px;
            cursor: pointer; box-shadow: 0 4px 16px rgba(255, 107, 107, 0.35);
            transition: all 0.3s;
        }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-primary:disabled { background: #dee2e6; color: #868e96; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .loading-container { margin-top: 24px; display: flex; justify-content: center; }
        .loading-container.hidden { display: none !important; }
        .loader {
            border: 4px solid #fee2e2; border-top: 4px solid #ff7e5f;
            border-radius: 50%; width: 44px; height: 44px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .result-section { margin-top: 24px; }
        .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .result-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
        .download-btn {
            padding: 8px 14px; background: #f1f3f4; color: #495057;
            font-size: 0.8rem; font-weight: 600; border: none;
            border-radius: 8px; cursor: pointer;
        }
        
        .result-card {
            background: white; border-radius: 16px; padding: 16px;
            margin-bottom: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
            border: 1px solid #f1f3f4;
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .result-text { flex: 1; font-weight: 500; line-height: 1.5; }
        .copy-btn {
            padding: 10px 16px; background: #f1f3f4; color: #495057;
            font-size: 0.85rem; font-weight: 600; border: none;
            border-radius: 10px; cursor: pointer;
        }
        
        .usage-counter { text-align: center; margin-top: 12px; font-size: 0.9rem; color: #868e96; }
        .error-message {
            margin-top: 16px; padding: 12px 16px; background: #fff5f5;
            border: 1px solid #fed7d7; border-radius: 12px;
            text-align: center; color: #c53030; font-weight: 500;
        }
        .hidden { display: none !important; }
        
        .form-section { margin-bottom: 20px; }
        
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f3f4; text-align: center; }
        .footer a { color: #ff7e5f; text-decoration: none; font-weight: 600; }
        .footer .copyright { margin-top: 12px; font-size: 0.8rem; color: #868e96; }
        
        .premium-ad {
            margin-top: 24px; padding: 20px;
            background: linear-gradient(135deg, #fff5f5, #ffe8e8);
            border: 1px solid #ffd6d6; border-radius: 16px; text-align: center;
        }
        .premium-ad h3 { font-size: 1rem; font-weight: 700; color: #c53030; margin-bottom: 6px; }
        .premium-ad p { font-size: 0.9rem; color: #e53e3e; }
    </style>
</head>
<body>
    <div class="content-wrapper">
        <header class="header-section">
            <h1 class="main-title"><span class="brand">XIΛIX</span>_후킹메세지 생성기</h1>
            <p class="sub-title">평범한 문장을 고객의 지갑을 여는<br>마법의 문장으로!</p>
        </header>

        <div class="card">
            <div class="form-section">
                <div class="step-label"><span class="step-number">1</span><span>어디에 사용하실 건가요?</span></div>
                <div id="channelSelector" class="channel-radio">
                    <div><input type="radio" id="blog" name="channel" value="블로그" checked><label for="blog">📝 블로그</label></div>
                    <div><input type="radio" id="story" name="channel" value="스토리"><label for="story">🤳 스토리</label></div>
                    <div><input type="radio" id="reels" name="channel" value="릴스"><label for="reels">🎬 릴스</label></div>
                    <div><input type="radio" id="post" name="channel" value="게시물"><label for="post">📸 게시물</label></div>
                </div>
            </div>

            <div class="form-section">
                <div class="step-label"><span class="step-number">2</span><span>후킹메세지로 바꾸고 싶은 내용</span></div>
                <textarea id="userInput" rows="3" class="input-textarea" placeholder="예시) 블로그 선택시 지역명을 꼭 포함해주세요"></textarea>
            </div>

            <button id="generateBtn" class="btn-primary">✨ 마법의 문장 생성하기</button>
            <p id="limitCounter" class="usage-counter">오늘 생성 가능 횟수: 3회</p>
        </div>

        <div id="loading" class="loading-container hidden"><div class="loader"></div></div>
        <div id="error" class="hidden error-message"></div>

        <div id="results" class="hidden result-section">
            <div class="result-header">
                <h2 id="resultTitle" class="result-title"></h2>
                <button id="downloadTxtBtn" class="download-btn">📥 TXT 저장</button>
            </div>
            <div id="resultCards"></div>
        </div>

        <div id="premiumAd" class="hidden premium-ad">
            <h3>✨ 더 강력한 기능이 필요하신가요?</h3>
            <p>유료 버전에서는 <strong>SEO 최적화 제목 추천</strong>, <strong>자동 해시태그 생성</strong> 기능이 제공됩니다!</p>
        </div>
        
        <footer class="footer">
            <a href="https://xivix.kr/" target="_blank">@XIΛIX</a>
            <p class="copyright">© 2025. ALL RIGHTS RESERVED.</p>
        </footer>
    </div>

    <script>
        // 보안: 우클릭, 단축키 방지
        document.addEventListener('contextmenu', e => { e.preventDefault(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'F12') { e.preventDefault(); return false; }
            if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) { e.preventDefault(); return false; }
            if (e.ctrlKey && ['u','s','p'].includes(e.key)) { e.preventDefault(); return false; }
        });
        document.addEventListener('dragstart', e => { e.preventDefault(); });

        const generateBtn = document.getElementById('generateBtn');
        const userInput = document.getElementById('userInput');
        const resultsDiv = document.getElementById('results');
        const resultTitle = document.getElementById('resultTitle');
        const resultCards = document.getElementById('resultCards');
        const loadingDiv = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        const limitCounter = document.getElementById('limitCounter');
        const premiumAd = document.getElementById('premiumAd');

        const DAILY_LIMIT = 3;
        let currentResults = [];
        let currentChannel = '';

        function getUsageData() {
            const data = localStorage.getItem('hookGeneratorUsage');
            if (data) return JSON.parse(data);
            return { count: 0, date: new Date().toLocaleDateString() };
        }

        function updateUsageData() {
            let data = getUsageData();
            const today = new Date().toLocaleDateString();
            if (data.date !== today) data = { count: 0, date: today };
            data.count++;
            localStorage.setItem('hookGeneratorUsage', JSON.stringify(data));
        }
        
        function checkUsage() {
            const data = getUsageData();
            const today = new Date().toLocaleDateString();
            if (data.date !== today) {
                limitCounter.textContent = '오늘 생성 가능 횟수: ' + DAILY_LIMIT + '회';
                return true;
            }
            const remaining = DAILY_LIMIT - data.count;
            limitCounter.textContent = '오늘 생성 가능 횟수: ' + (remaining > 0 ? remaining : 0) + '회';
            if (remaining <= 0) {
                generateBtn.disabled = true;
                generateBtn.textContent = '오늘 사용량을 모두 소진했어요';
                return false;
            }
            return true;
        }

        function updatePlaceholder() {
            const ch = document.querySelector('input[name="channel"]:checked').value;
            userInput.placeholder = ch === '블로그' ? "예시) 블로그 선택시 지역명을 꼭 포함해주세요" : "예시) 우리 미용실 20% 할인해요";
        }
        
        document.getElementById('channelSelector').addEventListener('change', updatePlaceholder);
        window.onload = () => { checkUsage(); updatePlaceholder(); };

        generateBtn.addEventListener('click', async () => {
            if (!checkUsage()) return;

            const inputText = userInput.value.trim();
            const selectedChannel = document.querySelector('input[name="channel"]:checked');

            if (!selectedChannel) { showError("채널을 선택해주세요!"); return; }
            if (!inputText) { showError("후킹메세지로 바꾸고 싶은 내용을 입력해주세요!"); return; }

            loadingDiv.classList.remove('hidden');
            errorDiv.classList.add('hidden');
            resultsDiv.classList.add('hidden');
            resultCards.innerHTML = '';
            premiumAd.classList.add('hidden');

            try {
                const prompt = createPrompt(inputText, selectedChannel.value);
                
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                const parsedResult = await response.json();
                
                if (!response.ok || parsedResult.error) {
                    throw new Error(parsedResult.error || 'API 오류가 발생했습니다.');
                }
                
                displayResults(parsedResult.suggestions, selectedChannel.value);
                updateUsageData();
                checkUsage();

            } catch (err) {
                showError(err.message || "메시지 생성에 실패했어요. 잠시 후 다시 시도해주세요.");
            } finally {
                loadingDiv.classList.add('hidden');
            }
        });

        function createPrompt(inputText, channel) {
            const base = '당신은 고객의 욕망을 정확히 꿰뚫어보는 대한민국 최고의 뷰티 마케터입니다. 미용실 원장님의 단순한 홍보 문구를, 고객이 클릭하지 않고는 못 배기는 "진짜 후킹 메시지"로 바꿔야 합니다.\\n\\n"후킹 메시지"란 단순 광고가 아닙니다. 아래의 공식을 활용하여 고객의 호기심을 자극하고, 문제를 해결해주거나, 놀라운 혜택을 암시해야 합니다.\\n- 문제 해결: "지긋지긋한 곱슬머리, 해결책은?"\\n- 비법 전수: "아침 잠 10분 더 자는 법"\\n- 반전 매력: "펌 했는데 머릿결이 더 좋아졌다고?"\\n- 질문 유도: "내 얼굴형에 딱 맞는 단발은?"\\n- 희소성 강조: "이번주만! 인생머리 5만원 할인"\\n\\n원장님의 핵심 메시지: "' + inputText + '"\\n\\n';
            let specific = '';
            if (channel === '블로그') {
                specific = '위의 후킹 공식을 활용하여, 네이버 블로그 상위 노출에 유리한 "클릭 유도형 제목" 5가지를 생성해주세요. 사용자가 입력한 내용에 지역명이 있다면 자연스럽게 활용하고, 없다면 지역명 없이 일반적인 정보성 제목으로 만들어주세요.';
            } else {
                specific = '위의 후킹 공식을 활용하여, 인스타그램 ' + channel + '에 사용할 매우 짧고 강력한 후킹 메시지 5가지를 생성해주세요. 5가지 결과물 중 3개는 반드시 5~6글자로, 나머지 2개는 반드시 7~8글자로 생성해야 합니다.';
            }
            return base + specific + '\\n\\n결과는 아래 JSON 형식의 배열로 반환해주세요:\\n{ "suggestions": ["결과 1", "결과 2", "결과 3", "결과 4", "결과 5"] }';
        }

        function displayResults(suggestions, channel) {
            currentResults = suggestions;
            currentChannel = channel;
            resultsDiv.classList.remove('hidden');
            premiumAd.classList.remove('hidden');
            resultTitle.innerHTML = 'AI 추천 <span style="color:#ff7e5f">' + channel + '</span> 메시지 🪄';
            
            suggestions.forEach(s => {
                const card = document.createElement('div');
                card.className = 'result-card';
                card.innerHTML = '<p class="result-text">' + s + '</p><button onclick="copyText(this, \\'' + s.replace(/'/g, "\\\\'") + '\\')" class="copy-btn">복사하기</button>';
                resultCards.appendChild(card);
            });
        }

        function showError(msg) { errorDiv.textContent = msg; errorDiv.classList.remove('hidden'); }

        function copyText(btn, text) {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            btn.textContent = '복사 완료!';
            setTimeout(() => { btn.textContent = '복사하기'; }, 2000);
        }

        document.getElementById('downloadTxtBtn').addEventListener('click', function() {
            if (currentResults.length === 0) return;
            const now = new Date();
            let content = '===========================================\\n';
            content += 'XIVIX 후킹메세지 생성기 결과\\n';
            content += '===========================================\\n\\n';
            content += '생성일: ' + now.toLocaleString('ko-KR') + '\\n';
            content += '채널: ' + currentChannel + '\\n\\n';
            content += '-------------------------------------------\\n';
            currentResults.forEach((msg, i) => { content += (i + 1) + '. ' + msg + '\\n\\n'; });
            content += '-------------------------------------------\\n';
            content += '(c) 2025 XIVIX. ALL RIGHTS RESERVED.\\n';
            
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'XIVIX_hooking_' + now.toISOString().slice(0,10) + '.txt';
            a.click();
            this.textContent = '저장 완료!';
            setTimeout(() => { this.textContent = '📥 TXT 저장'; }, 2000);
        });
    </script>
</body>
</html>`

app.get('/', (c) => c.html(htmlContent))
app.get('/index.html', (c) => c.html(htmlContent))

export default app
