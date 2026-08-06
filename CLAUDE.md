# CLAUDE.md — 학식 나우 (Haksik Now)

이 파일은 Claude Code가 이 프로젝트에서 작업할 때 지켜야 할 규칙입니다.
팀원 전원이 Claude Code로 작업하므로, 아래 규칙을 벗어나지 마세요.

## 프로젝트 개요

실시간 학식 혼잡도 현황판 + '지금 주문' + **AI 추천** 기능을 갖춘 **모바일 웹**.
교내 해커톤(12시간, 비전공자 3인) 프로젝트. 화면 데이터는 전부 **가짜(목업)**, AI 추천만 실제 호출.

화면 흐름: `/` 현황판 → `/restaurant/:id` 식당 상세 → `/order/:id` 지금 주문 → `/pay` 결제(목업) → `/order-complete` 주문완료

## 기술 스택

- React 19 + Vite
- react-router-dom (라우팅)
- 순수 CSS (`src/index.css`)
- AI 추천: FactChat 게이트웨이(OpenAI 호환) — 서버리스 함수 `api/recommend.js` 경유
- 배포: Vercel

## 명령어

```bash
npm install      # 최초 1회
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
```

## 절대 규칙 (반드시 지킬 것)

1. **DB·로그인·결제 만들지 마세요.** 데이터베이스, 회원가입/로그인, 실제 결제/PG 연동은 범위 밖입니다.
   - 예외: **AI 추천용 서버리스 함수 `api/recommend.js` 하나만** 허용됩니다. 이건 FactChat 키를 브라우저에 노출하지 않으려는 얇은 프록시일 뿐이고, DB·로그인·세션은 여전히 만들지 않습니다.
2. **화면에 쓰는 데이터는 목업(가짜).** 새 데이터가 필요하면 `src/data/mockData.js`에 상수로 추가합니다.
3. **`src/data/mockData.js`의 필드 이름을 바꾸지 마세요.** (`congestion`, `waitingCount`, `waitMinutes`, `hourly`, `menus`, `price`, `soldOut` 등) 여러 팀원이 이 형식에 의존합니다. 식당·메뉴 **추가**는 형식만 지키면 OK.
4. **모바일 우선.** 콘텐츠 최대 폭 480px, 가운데 정렬. 아이폰 폭(약 390px)에서 안 깨지게.
5. **라우팅 주소를 바꾸지 마세요.** 아래 7개로 고정.
   - 결제(`/pay`)도 **목업 화면**입니다. 결제수단 고르고 "결제하는 척"만 하고, 실제 돈·카드번호·PG 연동은 없습니다.
6. 새 라이브러리 설치는 꼭 필요할 때만. 기본은 React + react-router-dom로 해결.

## 폴더 구조 & 담당

```
api/
├─ recommend.js             # AI 추천 서버리스 함수 (Vercel) — 팀원1
└─ _core.js                 # FactChat 호출 공통 로직 (dev/prod 공유)
src/
├─ data/
│  ├─ mockData.js           # 공용 데이터 (팀원1) — 형식 고정
│  ├─ liveSim.js            # 실시간 혼잡도 시뮬레이션 (팀원1)
│  └─ cart.js               # 장바구니 로직 (팀원1)
├─ components/
│  ├─ BottomNav.jsx         # 하단 탭바 (홈/장바구니/주문내역)
│  ├─ AiRecommend.jsx       # AI 추천 카드 (팀원1)
│  ├─ Header.jsx            # 공용 상단바 (팀원3, 예정)
│  └─ CongestionBadge.jsx   # 혼잡도 신호등 배지 (팀원3, 예정)
├─ pages/
│  ├─ HomePage.jsx          # 화면1: 혼잡도 현황판 + AI 추천 (팀원1)
│  ├─ RestaurantPage.jsx    # 화면2: 식당 상세/메뉴/꺾은선 차트 (팀원2)
│  ├─ OrderPage.jsx         # 화면3: 메뉴 담기 + 지금 주문 (팀원2)
│  ├─ PaymentPage.jsx       # 결제 (목업) — 팀원1
│  ├─ OrderCompletePage.jsx # 주문 완료: 주문번호/QR (팀원2)
│  ├─ OrdersPage.jsx        # 주문 내역 (팀원1)
│  └─ CartPage.jsx          # 장바구니 (팀원1)
├─ App.jsx                  # 라우팅
├─ main.jsx                 # 진입점 (BrowserRouter)
└─ index.css                # 공용 스타일 (팀원3)
```

> 자기 담당 파일만 수정하세요. 다른 담당 파일을 고쳐야 하면 그 팀원과 먼저 상의.

## 공용 데이터 계약

### mockData.js
```js
// 각 식당: { id, name, congestion(0~100), waitingCount, waitMinutes, hourly[7개], menus[] }
// 각 메뉴: { id, name, price, soldOut }
// congestionLevel(c) → { label, color, emoji }
//   c<40: 여유 🟢 #22c55e / c<70: 보통 🟡 #f59e0b / 그 외: 혼잡 🔴 #ef4444
```
혼잡도 등급 표시는 **항상 `congestionLevel()`을 import해서** 쓰세요. 직접 색/이모지를 하드코딩하지 마세요.

### 라우팅 (고정)
| 주소 | 화면 |
|---|---|
| `/` | HomePage |
| `/restaurant/:id` | RestaurantPage |
| `/order/:id` | OrderPage |
| `/pay` | PaymentPage (결제 · 목업) |
| `/order-complete` | OrderCompletePage |
| `/orders` | OrdersPage (주문 내역, 팀원1 추가) |
| `/cart` | CartPage (장바구니, 팀원1 추가) |

화면 이동은 `useNavigate()`로: `navigate("/restaurant/r1")`

### 주문 저장 (localStorage)
```js
// 키 "haksik_orders": 주문 배열
//   { orderNo, restaurantId, restaurantName, items:[{id,name,price,qty}], total, createdAt }
// 키 "haksik_last_order": 방금 주문번호(문자열)
// 주문번호 생성: "A" + Date.now().toString().slice(-4)
```

## 디자인 톤

- 주 색상 `#2563eb`(파랑)
- 여유/보통/혼잡 `#22c55e` / `#f59e0b` / `#ef4444`
- 배경 `#f9fafb`, 카드 흰색 + 둥근 모서리 12px + 옅은 그림자

## git 워크플로우

- 작업 시작 전: `git pull`
- 작업 후: `git add .` → `git commit -m "한 일 한글로"` → `git push`
- 자기 담당 파일만 수정해서 충돌을 줄이세요.

## 상세 작업 지시

각 팀원의 구체적 작업과 프롬프트는 여기에 있습니다:
- 공용 규칙: `docs/superpowers/plans/team/00-공용규칙.md`
- 팀원1: `docs/superpowers/plans/team/팀원1-현황판.md`
- 팀원2: `docs/superpowers/plans/team/팀원2-메뉴주문.md`
- 팀원3: `docs/superpowers/plans/team/팀원3-디자인.md`
