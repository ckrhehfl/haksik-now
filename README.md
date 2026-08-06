# 학식 나우 (Haksik Now)

실시간 학식 혼잡도 현황판 + '지금 주문' 모바일 웹 — 교내 해커톤(12시간, 3인) 프로젝트.

## 시작하기

```bash
git clone <이 저장소 주소>
cd haksik-now
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.

## 이미 준비된 것 (뼈대)

- ✅ React(Vite) 프로젝트 + react-router-dom 설치
- ✅ 공용 데이터 `src/data/mockData.js` (⚠️ 형식 고정 — 바꾸지 말 것)
- ✅ 라우팅 `src/App.jsx` + `src/main.jsx` (BrowserRouter)
- ✅ 4개 화면 stub 파일 (`src/pages/*.jsx`) — 각자 채우면 됨
- ✅ 공용 기본 스타일 `src/index.css`

## 팀원별 할 일

각자 자기 문서를 열고, 안에 있는 "AI 붙여넣기 프롬프트"로 담당 파일을 채웁니다.

| 담당 | 문서 | 채울 파일 |
|---|---|---|
| 전원(먼저) | `docs/.../team/00-공용규칙.md` | (읽기) |
| 팀원1 | `팀원1-현황판.md` | `src/pages/HomePage.jsx` |
| 팀원2 | `팀원2-메뉴주문.md` | `src/pages/RestaurantPage.jsx`, `OrderPage.jsx`, `OrderCompletePage.jsx` |
| 팀원3 | `팀원3-디자인.md` | `src/index.css`, `src/components/Header.jsx`, `CongestionBadge.jsx` |

> 뼈대에서 `mockData.js`와 라우팅을 이미 만들어 두었으니, 팀원1은 프롬프트 ①②를 건너뛰고 **프롬프트 ③(HomePage)**부터 시작하면 됩니다.

## 화면 흐름

`/` 현황판 → `/restaurant/:id` 식당 상세 → `/order/:id` 지금 주문 → `/order-complete` 주문완료

## git 사용 (초보용)

시작 전 항상: `git pull`
작업 후: `git add .` → `git commit -m "한 일"` → `git push`
