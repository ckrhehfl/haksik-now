# 학식 나우 (Haksik Now) 🍚

실시간 학식 혼잡도 현황판 + '지금 주문' + **AI 추천** 모바일 웹 — 교내 해커톤(12시간, 비전공자 3인) 프로젝트. 전부 목업(가짜) 데이터로 동작합니다.

**🔗 배포(공개): https://haksik-now.vercel.app** ← 폰에서 바로 열림

> 자세한 진행 상황은 [`진행상황.md`](./진행상황.md) 참고.

## 시작하기

```bash
git clone https://github.com/ckrhehfl/haksik-now.git
cd haksik-now
npm install
npm run dev        # http://localhost:5173
```

### AI 추천을 로컬에서 쓰려면 (선택)
프로젝트 루트에 `.env.local` 파일을 만들고 키를 넣으세요 (`.env.example` 참고, git에 안 올라감):
```
FACTCHAT_API_KEY=본인_키
```
> 키가 없어도 나머지 화면(현황판·주문 등)은 전부 정상 동작합니다. AI 추천 버튼만 안내 메시지가 떠요.

## 기능

- **현황판** — 식당 5곳 실시간 혼잡도·대기 인원·예상 시간, 3초마다 갱신
- **🤖 AI 학식 추천** — 지금 혼잡도·메뉴를 AI가 보고 한 곳/메뉴를 추천
- **식당 상세** — 오늘 메뉴 + 시간대별 대기 꺾은선 차트(피크 라벨)
- **지금 주문 → 결제 → 주문 완료** — 메뉴 담기, 결제(목업), 주문번호, 가짜 QR
- **장바구니 · 주문 내역** — 상태 배지(접수→조리중→픽업 대기)

## 화면 흐름

```
현황판(/) ──▶ 식당 상세(/restaurant/:id) ──▶ 지금 주문(/order/:id) ──▶ 결제(/pay) ──▶ 주문 완료(/order-complete)
   │
   ├─▶ 장바구니(/cart)   ├─▶ 주문 내역(/orders)
   └─▶ 🤖 AI 추천 (현황판 상단 카드)
```

## 기술 스택

- React + Vite, react-router-dom, 순수 CSS
- AI: FactChat 게이트웨이(OpenAI 호환) — 서버리스 함수 `api/recommend.js` 경유(키는 서버에서만 사용)
- 배포: Vercel · 데이터는 전부 목업

## 팀원별 담당

| 담당 | 채운 파일 |
|---|---|
| 팀원1 | `data/mockData.js`, `data/liveSim.js`, `pages/HomePage.jsx`, `pages/OrdersPage.jsx`, `pages/CartPage.jsx`, AI 추천(`api/`, `components/AiRecommend.jsx`) |
| 팀원2 | `pages/RestaurantPage.jsx`, `pages/OrderPage.jsx`, `pages/OrderCompletePage.jsx` |
| 팀원3 | `index.css`, (예정) `components/Header.jsx`, `components/CongestionBadge.jsx` |

> 작업 규칙·데이터 계약은 [`CLAUDE.md`](./CLAUDE.md) 참고.

## 배포 (Vercel)

- `git push` 후 `vercel --prod` 로 재배포 (환경변수 `FACTCHAT_API_KEY`는 Vercel에 등록됨)
- ⚠️ AI 키가 노출됐다면 시연 후 재발급(rotate) 권장

## git 사용

```bash
git pull                          # 시작 전 항상
git add . && git commit -m "한 일" && git push
```
