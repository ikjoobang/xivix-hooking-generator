import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// API endpoint for Gemini AI - 사용자가 직접 API 키를 전달
app.post('/api/generate', async (c) => {
  try {
    const { prompt, apiKey } = await c.req.json()
    
    if (!apiKey) {
      return c.json({ error: 'API 키가 설정되지 않았습니다. 설정에서 Gemini API 키를 입력해주세요.' }, 400)
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
      if (errorData?.error?.message?.includes('API key not valid')) {
        return c.json({ error: 'API 키가 유효하지 않습니다. 올바른 Gemini API 키를 입력해주세요.' }, 400)
      }
      throw new Error(`API 오류: ${response.statusText}`)
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
    return c.json({ error: '메시지 생성에 실패했습니다. API 키를 확인해주세요.' }, 500)
  }
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'AI 후킹 메시지 생성기가 실행 중입니다.' })
})

// Main HTML page
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
        /* =========================================
           Typography & Layout System (Mobile First)
           ========================================= */
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #FFF7F5;
            color: #333333;
            word-break: keep-all;
            margin: 0;
            min-height: 100vh;
            min-height: 100dvh;
        }
        
        /* 모바일 스타일 (Mobile First - 기본) */
        body {
            font-size: 17px;
            line-height: 1.65;
            letter-spacing: -0.02em;
        }
        
        .content-wrapper {
            width: 100%;
            max-width: 100%;
            padding: 20px 16px;
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        
        /* PC 스타일 (Desktop) */
        @media (min-width: 769px) {
            body {
                font-size: 16px;
                line-height: 1.55;
                letter-spacing: -0.01em;
            }
            
            .content-wrapper {
                max-width: 720px;
                margin: 0 auto;
                padding: 40px;
            }
        }
        
        /* =========================================
           Header & Title Styles
           ========================================= */
        
        .header-section {
            text-align: center;
            margin-bottom: 24px;
            position: relative;
        }
        
        .main-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 8px;
            letter-spacing: -0.03em;
        }
        
        .main-title .brand {
            color: #ff7e5f;
        }
        
        .sub-title {
            font-size: 0.95rem;
            color: #666;
            font-weight: 400;
            line-height: 1.5;
        }
        
        /* Settings Button */
        .settings-btn {
            position: absolute;
            top: 0;
            right: 0;
            width: 40px;
            height: 40px;
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        
        .settings-btn:hover {
            background: #f8f9fa;
            transform: scale(1.05);
        }
        
        .settings-btn.has-key {
            border-color: #10b981;
            background: #ecfdf5;
        }
        
        @media (min-width: 769px) {
            .main-title {
                font-size: 2rem;
            }
            .sub-title {
                font-size: 1rem;
            }
        }
        
        /* =========================================
           Modal Styles
           ========================================= */
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-content {
            background: white;
            border-radius: 20px;
            padding: 24px;
            width: 100%;
            max-width: 400px;
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        
        .modal-overlay.active .modal-content {
            transform: translateY(0);
        }
        
        .modal-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 8px;
            text-align: center;
        }
        
        .modal-desc {
            font-size: 0.9rem;
            color: #666;
            text-align: center;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .modal-input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            font-size: 0.95rem;
            margin-bottom: 16px;
            transition: all 0.2s ease;
            font-family: monospace;
        }
        
        .modal-input:focus {
            outline: none;
            border-color: #ff7e5f;
            box-shadow: 0 0 0 4px rgba(255, 126, 95, 0.1);
        }
        
        .modal-input::placeholder {
            font-family: 'Noto Sans KR', sans-serif;
        }
        
        .modal-buttons {
            display: flex;
            gap: 10px;
        }
        
        .modal-btn {
            flex: 1;
            padding: 14px;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
        }
        
        .modal-btn-cancel {
            background: #f1f3f4;
            color: #495057;
        }
        
        .modal-btn-save {
            background: linear-gradient(135deg, #ff7e5f, #ff6b6b);
            color: white;
        }
        
        .modal-btn:active {
            transform: scale(0.98);
        }
        
        .modal-help {
            margin-top: 16px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 10px;
            font-size: 0.85rem;
            color: #666;
        }
        
        .modal-help a {
            color: #ff7e5f;
            text-decoration: none;
            font-weight: 600;
        }
        
        .api-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-bottom: 16px;
            font-size: 0.9rem;
        }
        
        .api-status.connected {
            color: #10b981;
        }
        
        .api-status.disconnected {
            color: #ef4444;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
        }
        
        /* =========================================
           Card Styles
           ========================================= */
        
        .card {
            background-color: white;
            border-radius: 20px;
            padding: 24px 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            border: 1px solid #FFE4E1;
        }
        
        @media (min-width: 769px) {
            .card {
                padding: 32px;
                border-radius: 24px;
            }
        }
        
        /* =========================================
           Form Elements
           ========================================= */
        
        .step-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        
        .step-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #ff7e5f, #ff6b6b);
            color: white;
            font-size: 0.8rem;
            font-weight: 700;
            border-radius: 50%;
        }
        
        /* Channel Radio Buttons */
        .channel-radio {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .channel-radio input[type="radio"] {
            display: none;
        }
        
        .channel-radio label {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 8px;
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.95rem;
            font-weight: 500;
            color: #495057;
            text-align: center;
        }
        
        .channel-radio input[type="radio"]:checked + label {
            background: linear-gradient(135deg, #ff7e5f, #ff6b6b);
            color: white;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        
        .channel-radio label:active {
            transform: scale(0.98);
        }
        
        @media (min-width: 769px) {
            .channel-radio {
                grid-template-columns: repeat(4, 1fr);
            }
        }
        
        /* Textarea */
        .input-textarea {
            width: 100%;
            padding: 16px;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            font-size: 1rem;
            line-height: 1.6;
            resize: none;
            transition: all 0.2s ease;
            background: #f8f9fa;
            font-family: inherit;
        }
        
        .input-textarea:focus {
            outline: none;
            border-color: #ff7e5f;
            background: white;
            box-shadow: 0 0 0 4px rgba(255, 126, 95, 0.1);
        }
        
        .input-textarea::placeholder {
            color: #adb5bd;
        }
        
        /* =========================================
           Button Styles
           ========================================= */
        
        .btn-primary {
            width: 100%;
            background: linear-gradient(135deg, #ff7e5f, #ff6b6b);
            color: white;
            font-weight: 700;
            font-size: 1.1rem;
            padding: 16px 24px;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(255, 107, 107, 0.35);
            letter-spacing: -0.02em;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.45);
        }
        
        .btn-primary:active {
            transform: translateY(0);
        }
        
        .btn-primary:disabled {
            background: #dee2e6;
            color: #868e96;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        /* =========================================
           Loader
           ========================================= */
        
        .loading-container {
            margin-top: 24px;
            display: flex;
            justify-content: center;
        }
        
        .loading-container.hidden {
            display: none !important;
        }
        
        .loader {
            border: 4px solid #fee2e2;
            border-top: 4px solid #ff7e5f;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* =========================================
           Result Cards
           ========================================= */
        
        .result-section {
            margin-top: 24px;
        }
        
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .result-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
        }
        
        .download-btn {
            padding: 8px 14px;
            background: #f1f3f4;
            color: #495057;
            font-size: 0.8rem;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .download-btn:hover {
            background: #e9ecef;
        }
        
        .download-btn:active {
            transform: scale(0.95);
        }
        
        .result-card {
            background: white;
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            border: 1px solid #f1f3f4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            transition: all 0.2s ease;
        }
        
        .result-card:active {
            transform: scale(0.99);
        }
        
        .result-text {
            flex: 1;
            font-size: 1rem;
            color: #1a1a1a;
            line-height: 1.5;
            font-weight: 500;
        }
        
        .copy-btn {
            flex-shrink: 0;
            padding: 10px 16px;
            background: #f1f3f4;
            color: #495057;
            font-size: 0.85rem;
            font-weight: 600;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .copy-btn:hover {
            background: #e9ecef;
        }
        
        .copy-btn:active {
            transform: scale(0.95);
        }
        
        /* =========================================
           Premium Ad & Footer
           ========================================= */
        
        .premium-ad {
            margin-top: 24px;
            padding: 20px;
            background: linear-gradient(135deg, #fff5f5, #ffe8e8);
            border: 1px solid #ffd6d6;
            border-radius: 16px;
            text-align: center;
        }
        
        .premium-ad h3 {
            font-size: 1rem;
            font-weight: 700;
            color: #c53030;
            margin-bottom: 6px;
        }
        
        .premium-ad p {
            font-size: 0.9rem;
            color: #e53e3e;
            line-height: 1.5;
        }
        
        /* Footer */
        .footer {
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #f1f3f4;
            text-align: center;
        }
        
        .footer a {
            color: #ff7e5f;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            transition: color 0.2s ease;
        }
        
        .footer a:hover {
            color: #ff6b6b;
            text-decoration: underline;
        }
        
        .footer .copyright {
            margin-top: 12px;
            font-size: 0.8rem;
            color: #868e96;
            letter-spacing: 0.02em;
        }
        
        /* =========================================
           Usage Counter
           ========================================= */
        
        .usage-counter {
            text-align: center;
            margin-top: 12px;
            font-size: 0.9rem;
            color: #868e96;
        }
        
        /* =========================================
           Error Message
           ========================================= */
        
        .error-message {
            margin-top: 16px;
            padding: 12px 16px;
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 12px;
            text-align: center;
            color: #c53030;
            font-weight: 500;
            font-size: 0.95rem;
        }
        
        /* =========================================
           Section Spacing
           ========================================= */
        
        .form-section {
            margin-bottom: 20px;
        }
        
        .form-section:last-of-type {
            margin-bottom: 0;
        }
        
        /* =========================================
           Dark Mode Support
           ========================================= */
        
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #1a1a1a;
                color: #e0e0e0;
            }
            
            .card, .result-card {
                background-color: #2d2d2d;
                border-color: #404040;
            }
            
            .main-title {
                color: #fff;
            }
            
            .sub-title {
                color: #a0a0a0;
            }
            
            .step-label {
                color: #fff;
            }
            
            .channel-radio label {
                background: #333;
                border-color: #404040;
                color: #e0e0e0;
            }
            
            .input-textarea, .modal-input {
                background: #333;
                border-color: #404040;
                color: #e0e0e0;
            }
            
            .input-textarea:focus, .modal-input:focus {
                background: #2d2d2d;
            }
            
            .result-text {
                color: #e0e0e0;
            }
            
            .copy-btn {
                background: #404040;
                color: #e0e0e0;
            }
            
            .copy-btn:hover {
                background: #4a4a4a;
            }
            
            .premium-ad {
                background: linear-gradient(135deg, #2d2020, #3d2020);
                border-color: #4d3030;
            }
            
            .footer {
                border-color: #404040;
            }
            
            .footer .copyright {
                color: #666;
            }
            
            .settings-btn {
                background: #2d2d2d;
                border-color: #404040;
            }
            
            .modal-content {
                background: #2d2d2d;
            }
            
            .modal-title {
                color: #fff;
            }
            
            .modal-desc {
                color: #a0a0a0;
            }
            
            .modal-help {
                background: #333;
            }
            
            .modal-btn-cancel {
                background: #404040;
                color: #e0e0e0;
            }
        }
        
        /* =========================================
           Security: Anti-Copy Protection
           ========================================= */
        
        /* 결과물 외 전체 복사 방지 */
        body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* 입력창은 선택 가능하게 */
        .input-textarea, .modal-input {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        
        /* 결과 텍스트만 선택 가능 (복사 버튼으로만 복사) */
        .result-text {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
    </style>
</head>
<body>
    <div class="content-wrapper">
        <!-- Header -->
        <header class="header-section">
            <button id="settingsBtn" class="settings-btn" title="API 설정">⚙️</button>
            <h1 class="main-title"><span class="brand">XIΛIX</span>_후킹메세지 생성기</h1>
            <p class="sub-title">평범한 문장을 고객의 지갑을 여는<br>마법의 문장으로!</p>
        </header>

        <!-- Main Card -->
        <div class="card">
            <!-- Step 1: Channel Selection -->
            <div class="form-section">
                <div class="step-label">
                    <span class="step-number">1</span>
                    <span>어디에 사용하실 건가요?</span>
                </div>
                <div id="channelSelector" class="channel-radio">
                    <div><input type="radio" id="blog" name="channel" value="블로그" checked><label for="blog">📝 블로그</label></div>
                    <div><input type="radio" id="story" name="channel" value="스토리"><label for="story">🤳 스토리</label></div>
                    <div><input type="radio" id="reels" name="channel" value="릴스"><label for="reels">🎬 릴스</label></div>
                    <div><input type="radio" id="post" name="channel" value="게시물"><label for="post">📸 게시물</label></div>
                </div>
            </div>

            <!-- Step 2: Input -->
            <div class="form-section">
                <div class="step-label">
                    <span class="step-number">2</span>
                    <span>후킹메세지로 바꾸고 싶은 내용</span>
                </div>
                <textarea id="userInput" rows="3" class="input-textarea" placeholder="예시) 블로그 선택시 지역명을 꼭 포함해주세요"></textarea>
            </div>

            <!-- Generate Button -->
            <button id="generateBtn" class="btn-primary">
                ✨ 마법의 문장 생성하기
            </button>
            
            <!-- Usage Counter -->
            <p id="limitCounter" class="usage-counter">오늘 생성 가능 횟수: 3회</p>
        </div>

        <!-- Loading -->
        <div id="loading" class="loading-container hidden">
            <div class="loader"></div>
        </div>
        
        <!-- Error -->
        <div id="error" class="hidden error-message"></div>

        <!-- Results -->
        <div id="results" class="hidden result-section">
            <div class="result-header">
                <h2 id="resultTitle" class="result-title"></h2>
                <button id="downloadTxtBtn" class="download-btn">📥 TXT 저장</button>
            </div>
            <div id="resultCards"></div>
        </div>

        <!-- Premium Ad -->
        <div id="premiumAd" class="hidden premium-ad">
            <h3>✨ 더 강력한 기능이 필요하신가요?</h3>
            <p>유료 버전에서는 <strong>SEO 최적화 제목 추천</strong>, <strong>자동 해시태그 생성</strong> 기능이 제공됩니다!</p>
        </div>
        
        <!-- Footer -->
        <footer class="footer">
            <a href="https://xivix.kr/" target="_blank" rel="noopener noreferrer">@XIΛIX</a>
            <p class="copyright">© 2025. ALL RIGHTS RESERVED.</p>
        </footer>
    </div>
    
    <!-- Settings Modal -->
    <div id="settingsModal" class="modal-overlay">
        <div class="modal-content">
            <h2 class="modal-title">🔑 API 키 설정</h2>
            <p class="modal-desc">Gemini API 키를 입력하면<br>자동으로 저장됩니다.</p>
            
            <div id="apiStatus" class="api-status disconnected">
                <span class="status-dot"></span>
                <span>연결 안됨</span>
            </div>
            
            <input type="password" id="apiKeyInput" class="modal-input" placeholder="API 키를 입력하세요">
            
            <div class="modal-buttons">
                <button id="modalCancel" class="modal-btn modal-btn-cancel">취소</button>
                <button id="modalSave" class="modal-btn modal-btn-save">저장</button>
            </div>
            
            <div class="modal-help">
                📌 API 키가 없으신가요?<br>
                <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a>에서 무료로 발급받으세요!
            </div>
        </div>
    </div>

    <script>
        /* =========================================
           Security Protection Scripts
           ========================================= */
        
        // 1. 우클릭 방지
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // 2. 키보드 단축키 방지
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12') { e.preventDefault(); return false; }
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) { e.preventDefault(); return false; }
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p')) { e.preventDefault(); return false; }
            if (e.ctrlKey && (e.key === 'c' || e.key === 'a')) {
                const activeElement = document.activeElement;
                if (!activeElement || (activeElement.tagName !== 'TEXTAREA' && activeElement.tagName !== 'INPUT')) {
                    e.preventDefault();
                    return false;
                }
            }
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                navigator.clipboard.writeText('');
                return false;
            }
        });
        
        // 3. 드래그 방지
        document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });
        
        // 4. 선택 방지 (입력창 제외)
        document.addEventListener('selectstart', function(e) {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
                return true;
            }
            e.preventDefault();
            return false;
        });
        
        // 5. 복사 이벤트 차단
        document.addEventListener('copy', function(e) {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
                return true;
            }
            e.preventDefault();
            return false;
        });
        
        /* =========================================
           API Key Management
           ========================================= */
        
        const API_KEY_STORAGE = 'xivix_gemini_api_key';
        
        function getStoredApiKey() {
            try {
                const stored = localStorage.getItem(API_KEY_STORAGE);
                if (!stored) return null;
                // JSON으로 저장된 키 복원
                return JSON.parse(stored).k || null;
            } catch (e) {
                // 이전 버전 호환 (직접 저장된 경우)
                const direct = localStorage.getItem(API_KEY_STORAGE);
                if (direct && direct.startsWith('AIza')) return direct;
                return null;
            }
        }
        
        function setStoredApiKey(key) {
            try {
                // JSON으로 감싸서 저장
                localStorage.setItem(API_KEY_STORAGE, JSON.stringify({ k: key, t: Date.now() }));
                return true;
            } catch (e) {
                return false;
            }
        }
        
        function updateApiStatus() {
            const apiKey = getStoredApiKey();
            const statusEl = document.getElementById('apiStatus');
            const settingsBtn = document.getElementById('settingsBtn');
            
            if (apiKey) {
                statusEl.className = 'api-status connected';
                statusEl.innerHTML = '<span class="status-dot"></span><span>연결됨 (' + apiKey.substring(0, 8) + '...)</span>';
                settingsBtn.classList.add('has-key');
            } else {
                statusEl.className = 'api-status disconnected';
                statusEl.innerHTML = '<span class="status-dot"></span><span>연결 안됨</span>';
                settingsBtn.classList.remove('has-key');
            }
        }
        
        /* =========================================
           Modal Management
           ========================================= */
        
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const modalCancel = document.getElementById('modalCancel');
        const modalSave = document.getElementById('modalSave');
        const apiKeyInput = document.getElementById('apiKeyInput');
        
        settingsBtn.addEventListener('click', function() {
            const currentKey = getStoredApiKey();
            apiKeyInput.value = currentKey || '';
            settingsModal.classList.add('active');
        });
        
        modalCancel.addEventListener('click', function() {
            settingsModal.classList.remove('active');
        });
        
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
        
        modalSave.addEventListener('click', function() {
            const key = apiKeyInput.value.trim();
            if (key) {
                setStoredApiKey(key);
                updateApiStatus();
                settingsModal.classList.remove('active');
                showError(''); // 에러 메시지 숨기기
                hideError();
            } else {
                localStorage.removeItem(API_KEY_STORAGE);
                updateApiStatus();
                settingsModal.classList.remove('active');
            }
        });
        
        /* =========================================
           Main Application Scripts
           ========================================= */
        
        const generateBtn = document.getElementById('generateBtn');
        const userInput = document.getElementById('userInput');
        const resultsDiv = document.getElementById('results');
        const resultTitle = document.getElementById('resultTitle');
        const resultCards = document.getElementById('resultCards');
        const loadingDiv = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        const limitCounter = document.getElementById('limitCounter');
        const premiumAd = document.getElementById('premiumAd');
        const channelSelector = document.getElementById('channelSelector');

        const DAILY_LIMIT = 3;

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
            const selectedChannel = document.querySelector('input[name="channel"]:checked').value;
            if (selectedChannel === '블로그') {
                userInput.placeholder = "예시) 블로그 선택시 지역명을 꼭 포함해주세요";
            } else {
                userInput.placeholder = "예시) 우리 미용실 20% 할인해요";
            }
        }
        
        channelSelector.addEventListener('change', updatePlaceholder);
        
        window.onload = () => {
            checkUsage();
            updatePlaceholder();
            updateApiStatus();
            
            // API 키 없으면 모달 자동 오픈
            if (!getStoredApiKey()) {
                setTimeout(() => {
                    settingsModal.classList.add('active');
                }, 500);
            }
        };

        generateBtn.addEventListener('click', async () => {
            if (!checkUsage()) return;
            
            const apiKey = getStoredApiKey();
            if (!apiKey) {
                showError("API 키가 설정되지 않았습니다. 설정 버튼(⚙️)을 눌러 API 키를 입력해주세요.");
                settingsModal.classList.add('active');
                return;
            }

            const inputText = userInput.value.trim();
            const selectedChannel = document.querySelector('input[name="channel"]:checked');

            if (!selectedChannel) {
                showError("어디에 사용할지 채널을 선택해주세요!");
                return;
            }
            if (!inputText) {
                showError("후킹메세지로 바꾸고 싶은 내용을 입력해주세요!");
                return;
            }

            showLoading(true);
            hideError();
            resultsDiv.classList.add('hidden');
            resultCards.innerHTML = '';
            premiumAd.classList.add('hidden');

            try {
                const prompt = createPrompt(inputText, selectedChannel.value);
                
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, apiKey })
                });

                const parsedResult = await response.json();
                
                if (!response.ok || parsedResult.error) {
                    throw new Error(parsedResult.error || 'API 오류가 발생했습니다.');
                }
                
                displayResults(parsedResult.suggestions, selectedChannel.value);
                updateUsageData();
                checkUsage();

            } catch (err) {
                console.error(err);
                showError(err.message || "메시지 생성에 실패했어요. API 키를 확인해주세요.");
            } finally {
                showLoading(false);
            }
        });

        function createPrompt(inputText, channel) {
            const basePrompt = '당신은 고객의 욕망을 정확히 꿰뚫어보는 대한민국 최고의 뷰티 마케터입니다. 미용실 원장님의 단순한 홍보 문구를, 고객이 클릭하지 않고는 못 배기는 "진짜 후킹 메시지"로 바꿔야 합니다.\\n\\n"후킹 메시지"란 단순 광고가 아닙니다. 아래의 공식을 활용하여 고객의 호기심을 자극하고, 문제를 해결해주거나, 놀라운 혜택을 암시해야 합니다.\\n- 문제 해결: "지긋지긋한 곱슬머리, 해결책은?"\\n- 비법 전수: "아침 잠 10분 더 자는 법"\\n- 반전 매력: "펌 했는데 머릿결이 더 좋아졌다고?"\\n- 질문 유도: "내 얼굴형에 딱 맞는 단발은?"\\n- 희소성 강조: "이번주만! 인생머리 5만원 할인"\\n\\n원장님의 핵심 메시지: "' + inputText + '"\\n\\n';
            let specificPrompt = '';

            switch (channel) {
                case '블로그':
                    specificPrompt = '위의 후킹 공식을 활용하여, 네이버 블로그 상위 노출에 유리한 "클릭 유도형 제목" 5가지를 생성해주세요. 사용자가 입력한 내용에 지역명이 있다면 자연스럽게 활용하고, 없다면 지역명 없이 일반적인 정보성 제목으로 만들어주세요.';
                    break;
                case '스토리':
                case '릴스':
                case '게시물':
                    specificPrompt = '위의 후킹 공식을 활용하여, 인스타그램 ' + channel + '에 사용할 매우 짧고 강력한 후킹 메시지 5가지를 생성해주세요. 5가지 결과물 중 3개는 반드시 5~6글자로, 나머지 2개는 반드시 7~8글자로 생성해야 합니다. 각 채널의 특성을 살려 궁금증을 극대화 시켜주세요.';
                    break;
            }
            return basePrompt + specificPrompt + '\\n\\n결과는 아래 JSON 형식의 배열로 반환해주세요:\\n{ "suggestions": ["결과 1", "결과 2", "결과 3", "결과 4", "결과 5"] }';
        }

        function displayResults(suggestions, channel) {
            // TXT 다운로드를 위해 결과 저장
            currentResults = suggestions;
            currentChannel = channel;
            
            resultsDiv.classList.remove('hidden');
            premiumAd.classList.remove('hidden');
            resultTitle.innerHTML = 'AI 추천 <span style="color:#ff7e5f">' + channel + '</span> 메시지 🪄';
            
            suggestions.forEach(suggestion => {
                const card = document.createElement('div');
                card.className = 'result-card';
                card.innerHTML = '<p class="result-text">' + suggestion + '</p><button onclick="copyToClipboard(this, \\'' + suggestion.replace(/'/g, "\\\\'") + '\\')" class="copy-btn">복사하기</button>';
                resultCards.appendChild(card);
            });
        }

        function showLoading(isLoading) {
            if (isLoading) {
                loadingDiv.classList.remove('hidden');
            } else {
                loadingDiv.classList.add('hidden');
            }
        }

        function showError(message) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }

        function hideError() {
            errorDiv.classList.add('hidden');
        }
        
        function copyToClipboard(button, text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            button.textContent = '복사 완료!';
            setTimeout(() => {
                button.textContent = '복사하기';
            }, 2000);
        }
        
        /* =========================================
           TXT Download Function
           ========================================= */
        
        // 전역 변수로 결과 저장
        let currentResults = [];
        let currentChannel = '';
        
        document.getElementById('downloadTxtBtn').addEventListener('click', function() {
            if (currentResults.length === 0) return;
            
            const now = new Date();
            const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\\./g, '-').replace(/ /g, '').slice(0, -1);
            const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '-');
            
            let content = '===========================================\\n';
            content += 'XIΛIX 후킹메세지 생성기 결과\\n';
            content += '===========================================\\n\\n';
            content += '생성일: ' + now.toLocaleString('ko-KR') + '\\n';
            content += '채널: ' + currentChannel + '\\n\\n';
            content += '-------------------------------------------\\n';
            content += '생성된 후킹 메시지\\n';
            content += '-------------------------------------------\\n\\n';
            
            currentResults.forEach((msg, index) => {
                content += (index + 1) + '. ' + msg + '\\n\\n';
            });
            
            content += '-------------------------------------------\\n';
            content += '(c) 2025 XIVIX. ALL RIGHTS RESERVED.\\n';
            content += 'https://xivix.kr/\\n';
            content += '-------------------------------------------\\n';
            
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'XIVIX_hooking_' + dateStr + '_' + timeStr + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.textContent = '저장 완료!';
            setTimeout(() => {
                this.textContent = '📥 TXT 저장';
            }, 2000);
        });
    </script>
</body>
</html>`

// Serve main HTML for root
app.get('/', (c) => {
  return c.html(htmlContent)
})

app.get('/index.html', (c) => {
  return c.html(htmlContent)
})

export default app
