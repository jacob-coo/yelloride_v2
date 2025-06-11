# YelloRide v2 - 미주 특화 택시예약 앱

## 프로젝트 구조

```
Yelloride_v2/
├── frontend/          # React 프론트엔드
│   ├── public/
│   └── src/
│       ├── App.js     # 메인 앱 컴포넌트
│       ├── index.js   # 엔트리 포인트
│       └── index.css  # 스타일시트
├── backend/           # Express 백엔드
│   ├── server.js      # 서버 메인 파일
│   └── package.json
└── package.json       # 루트 패키지 설정
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm run install:all
```

### 2. 개발 서버 실행
```bash
npm run dev
```

이 명령어는 프론트엔드(3000번 포트)와 백엔드(5001번 포트)를 동시에 실행합니다.

### 3. 프로덕션 빌드
```bash
npm run build
```

## 주요 기능

- 지역별 택시 예약 (LA, NY)
- 편도/왕복 선택
- 공항 픽업 정보 입력
- 추가 옵션 선택 (카시트, 휠체어 등)
- 실시간 요금 계산
- 카카오톡/문자 알림 서비스

## API 엔드포인트

- `GET /api/health` - 서버 상태 확인
- `GET /api/routes/:region` - 지역별 경로 정보
- `GET /api/route` - 특정 경로 요금 조회
- `POST /api/bookings` - 예약 생성