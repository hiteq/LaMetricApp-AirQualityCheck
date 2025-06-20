# 🚀 GitHub Actions로 서버 없는 대기질 API 구축

**서버 배포 없이** GitHub에서 무료로 대기질 데이터 API를 운영하는 방법입니다!

## 🎯 어떻게 작동하나요?

1. **GitHub Actions**가 매 15분마다 Air Korea API 호출
2. 받은 데이터를 LaMetric 형식으로 변환
3. **GitHub Pages**에 정적 JSON 파일로 저장
4. LaMetric이 GitHub Pages URL을 폴링

## 📋 설정 단계

### 1️⃣ GitHub Secrets에 API 키 추가

1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. 이름: `AIR_KOREA_API_KEY`
4. 값: 발급받은 공공데이터포털 API 키 입력

### 2️⃣ GitHub Pages 활성화

1. GitHub 저장소 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` 또는 `master` 선택
4. Folder: `/docs` 선택
5. **Save** 클릭

### 3️⃣ 워크플로우 권한 설정

1. GitHub 저장소 → **Settings** → **Actions** → **General**
2. **Workflow permissions**에서 **Read and write permissions** 선택
3. **Allow GitHub Actions to create and approve pull requests** 체크
4. **Save** 클릭

### 4️⃣ 첫 실행

파일들을 커밋하면 자동으로 첫 실행이 시작됩니다:

```bash
git add .
git commit -m "🚀 GitHub Actions 서버리스 API 구축"
git push
```

## 🔗 LaMetric 설정

GitHub Pages가 활성화되면 다음 URL을 사용할 수 있습니다:

### 기본 URL (종로구)
```
https://[username].github.io/lametric-time-aqcheck/index.json
```

### 특정 측정소
```
https://[username].github.io/lametric-time-aqcheck/강남구.json
https://[username].github.io/lametric-time-aqcheck/마포구.json
https://[username].github.io/lametric-time-aqcheck/종로구.json
```

**[username]을 실제 GitHub 사용자명으로 바꿔주세요!**

## 📊 사용 가능한 측정소

- 종로구, 중구, 강남구, 마포구, 송파구
- 강서구, 영등포구, 성북구, 용산구, 서초구

다른 측정소가 필요하면 `.github/scripts/update-air-quality.js`의 `STATIONS` 배열을 수정하세요.

## ⚙️ 설정 커스터마이징

### 업데이트 주기 변경

`.github/workflows/update-air-quality.yml`에서 `cron` 값을 수정:

```yaml
schedule:
  # 매 30분마다
  - cron: '*/30 * * * *'
  
  # 매 시간마다  
  - cron: '0 * * * *'
  
  # 매일 오전 9시
  - cron: '0 9 * * *'
```

### 측정소 추가/변경

`.github/scripts/update-air-quality.js`에서 수정:

```javascript
const STATIONS = [
    '종로구', '강남구', '부산', '인천', // 원하는 측정소 추가
];
```

## 🔍 모니터링

### GitHub Actions 상태 확인
- **Actions** 탭에서 워크플로우 실행 상태 확인
- 실패 시 로그에서 오류 원인 파악

### 데이터 확인
- `https://[username].github.io/lametric-time-aqcheck/` 접속
- 각 JSON 파일과 README.md 확인

## 🆘 문제 해결

### ❌ Actions 실행 실패
1. **API 키 확인**: Secrets에 올바른 키가 설정되어 있는지
2. **권한 확인**: Write permissions가 활성화되어 있는지
3. **브랜치 확인**: 올바른 브랜치에서 실행되고 있는지

### ❌ GitHub Pages 접속 불가
1. **Pages 설정**: `/docs` 폴더가 선택되어 있는지
2. **첫 실행**: Actions가 최소 한 번 성공했는지 확인
3. **URL 확인**: username과 repository 이름이 정확한지

### ❌ LaMetric에서 데이터 안 보임
1. **JSON 형식**: 브라우저에서 JSON URL 직접 접속해보기
2. **CORS**: GitHub Pages는 CORS를 자동 지원함
3. **캐시**: LaMetric 앱에서 강제 새로고침

## 💡 장점

✅ **완전 무료** (GitHub 무료 계정으로 충분)  
✅ **서버 관리 불필요** (GitHub이 모든 인프라 관리)  
✅ **자동 업데이트** (설정한 주기로 자동 실행)  
✅ **안정적** (GitHub의 99.9% 업타임)  
✅ **확장 가능** (원하는 측정소와 데이터 추가 가능)  

## 🔄 업데이트 주기

- **기본**: 매 15분마다 업데이트
- **API 제한**: Air Korea API 제한에 맞춰 조절
- **LaMetric 폴링**: 5분 간격 권장

---

이제 서버 없이도 실시간 대기질 정보를 LaMetric에서 볼 수 있습니다! 🌫️📱 