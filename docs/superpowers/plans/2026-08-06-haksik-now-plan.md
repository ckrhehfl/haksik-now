# 학식 나우 (Haksik Now) 구현 계획

> **리더용 문서입니다.** 전체 흐름·통합·타임라인을 관리하는 사람이 봅니다.
> 팀원은 각자 `team/` 폴더의 자기 카드만 봐도 진행할 수 있습니다.

**목표:** 실시간 학식 혼잡도 현황판 + '지금 주문' 기능을 갖춘 모바일 웹을 12시간 안에 완성한다.

**아키텍처:** React(Vite) 단일 페이지 앱. 백엔드·DB·로그인 없음. 모든 데이터는 프론트엔드의 목업 파일(`src/data/mockData.js`)에 두고, 실시간 느낌은 `setInterval`로 혼잡도 값을 흔들어 구현. 주문 내역은 `localStorage`에 저장.

**기술 스택:** React 18 + Vite, react-router-dom, 순수 CSS, Vercel 배포. 개발은 전부 **Claude Code(터미널 CLI)**로 진행.

## 전역 제약 (Global Constraints)

- 모든 데이터는 목업(가짜). 실제 서버·결제·연동 없음.
- 로그인/회원가입 없음.
- 모바일 화면 폭(약 390px) 우선 디자인.
- 공용 데이터 형식(`src/data/mockData.js`)은 초반에 확정하고 이후 바꾸지 않는다. (바꿔야 하면 팀 전체에 공지)
- 파일 충돌 방지를 위해 화면별로 파일을 분리한다.

---

## 폴더 구조 (파일 담당)

```
haksik-now/
├─ src/
│  ├─ data/mockData.js          # 공용 데이터 (팀원1이 초기 생성 → 전원 사용)
│  ├─ components/
│  │  ├─ Header.jsx             # 공용 상단바 (팀원3)
│  │  └─ CongestionBadge.jsx    # 혼잡도 신호등 배지 (팀원3)
│  ├─ pages/
│  │  ├─ HomePage.jsx           # 화면1: 혼잡도 현황판 (팀원1)
│  │  ├─ RestaurantPage.jsx     # 화면2: 식당 상세/메뉴/그래프 (팀원2)
│  │  ├─ OrderPage.jsx          # 화면3: 메뉴 담기 + 지금 주문 (팀원2)
│  │  └─ OrderCompletePage.jsx  # 주문 완료: 주문번호/QR (팀원2)
│  ├─ App.jsx                   # 라우팅 (팀원1이 초기 생성)
│  ├─ main.jsx                  # 진입점 (스캐폴드 자동 생성)
│  └─ index.css                 # 공용 스타일 (팀원3)
├─ index.html
├─ package.json
└─ README.md
```

---

## 작업 순서 (의존성)

1. **Task 0 (리더/팀원1): 스캐폴드 + GitHub** ← 이게 먼저, 나머지는 여기서 갈라짐
2. 이후 병렬:
   - **팀원1**: `mockData.js` 확정 → `App.jsx` 라우팅 → `HomePage.jsx`(현황판+실시간)
   - **팀원2**: `RestaurantPage.jsx` → `OrderPage.jsx` → `OrderCompletePage.jsx`(localStorage)
   - **팀원3**: `index.css`(공용 스타일) → `Header.jsx` → `CongestionBadge.jsx` → 반응형 마무리 → (먼저 끝나면) 통합 지원
3. **통합 (6~9h)**: 화면 연결 확인, 데이터 흐름 점검
4. **마무리 (9~12h)**: 배포(Vercel), 버그 수정, 시연 리허설

> **핵심 순서 규칙**: `mockData.js`가 나오기 전에는 다른 화면이 데이터를 못 쓴다. 그래서 Task 0 직후 팀원1이 **가장 먼저 `mockData.js`를 확정**하고 push한다. 팀원2·3은 그걸 `git pull` 받은 뒤 시작한다.

---

## Task 0: 스캐폴드 + GitHub 저장소 (리더 또는 팀원1)

**목표:** 빈 React 프로젝트를 만들고 GitHub public 저장소에 올려 팀원을 초대한다.

- [ ] **Step 1: Vite React 프로젝트 생성**

```bash
npm create vite@latest haksik-now -- --template react
cd haksik-now
npm install
npm install react-router-dom
```

- [ ] **Step 2: 로컬 실행 확인**

```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 이 열리고 Vite 기본 화면이 보이면 성공.

- [ ] **Step 3: GitHub public 저장소 생성 + 첫 push** (`gh` 로그인 완료 상태 전제)

```bash
git init
git add .
git commit -m "chore: vite react 스캐폴드"
gh repo create haksik-now --public --source=. --remote=origin --push
```

- [ ] **Step 4: 팀원 2명 협업자 초대**

```bash
gh repo edit --add-collaborator <팀원1_깃허브아이디>
gh repo edit --add-collaborator <팀원2_깃허브아이디>
```
> 또는 GitHub 웹에서 Settings → Collaborators → Add people.

- [ ] **Step 5: 팀원에게 클론 안내**

각 팀원은 아래로 내려받아 시작:
```bash
git clone https://github.com/<본인또는리더아이디>/haksik-now.git
cd haksik-now
npm install
npm run dev
```

- [ ] **Step 6: 팀원별 작업 카드 전달**
  - 팀원1 → `docs/superpowers/plans/team/팀원1-현황판.md`
  - 팀원2 → `docs/superpowers/plans/team/팀원2-메뉴주문.md`
  - 팀원3 → `docs/superpowers/plans/team/팀원3-디자인.md`
  - 전원 → `docs/superpowers/plans/team/00-공용규칙.md` 먼저 읽기

---

## Task 1~3: 팀원별 상세 작업

각 팀원의 상세 작업(만들 것 / AI 프롬프트 / 확인 / 커밋)은 아래 카드 문서에 있습니다.

- **팀원1 (현황판+실시간+공용데이터)** → `team/팀원1-현황판.md`
- **팀원2 (메뉴+지금주문+localStorage)** → `team/팀원2-메뉴주문.md`
- **팀원3 (디자인+공용컴포넌트)** → `team/팀원3-디자인.md`
- **공용 규칙(데이터 형식·커밋법)** → `team/00-공용규칙.md`

---

## Task 4: 통합 & 배포 (전원, 6~12h)

- [ ] **Step 1: 통합 확인** — 메인 → 식당 상세 → 주문 → 주문완료까지 클릭으로 끝까지 흐르는지 확인.
- [ ] **Step 2: 실시간 확인** — 메인에서 혼잡도 숫자가 몇 초마다 바뀌는지 확인.
- [ ] **Step 3: 주문 유지 확인** — 주문 후 새로고침해도 주문번호가 남는지 확인(localStorage).
- [ ] **Step 4: Vercel 배포**

```bash
npm install -g vercel
vercel
```
> 또는 vercel.com에서 GitHub 저장소를 import (더 쉬움, 로그인 후 클릭 몇 번).

- [ ] **Step 5: 배포 URL로 3분 시연 리허설** — 전체 흐름(메인 → 상세 → 주문 → 완료)을 실제로 클릭해 확인.

---

## 성공 기준 (Definition of Done)

- 메인에서 식당별 혼잡도가 신호등으로 구분되고, 값이 실시간으로 변한다.
- 식당 상세에서 오늘 메뉴와 시간대별 혼잡 그래프가 보인다.
- 메뉴를 담아 "지금 주문"하면 주문번호가 발급되고, 새로고침해도 유지된다.
- 모바일 폭에서 자연스럽게 보인다.
- 배포 URL에서 전체 흐름을 3분 내 시연할 수 있다.
