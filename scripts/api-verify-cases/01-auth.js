/** 1단계 — 인증: 로그인, 토큰 갱신, 내 프로필 조회.
 * groupId 6("탈퇴테스트모임")과 무관, 계정 자체만 검증한다 — 데이터 오염 없음. */
const DEFAULT_EMAIL = 'billage.verify.dues.test@example.com';
const DEFAULT_PASSWORD = 'Billage1!Verify';

module.exports = {
  stage: '1단계 — 인증',
  cases: [
    {
      name: 'auth-login',
      method: 'POST',
      path: () => '/api/v1/auth/login',
      body: () => ({ email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD }),
      noAuth: true,
      expectStatus: 200,
      expectFields: ['data.user.userId', 'data.tokens.accessToken', 'data.tokens.refreshToken'],
      after: (ctx, parsed) => {
        // 이 실행의 로그인 토큰은 엔진이 시작할 때 이미 한 번 받아뒀지만(ctx.accessToken),
        // 이 케이스는 /auth/login 자체가 기대한 응답을 주는지 별도로 재검증하는 것이다.
        // refresh 케이스가 쓸 refreshToken은 여기서 새로 받은 값으로 갱신한다.
        ctx.refreshToken = parsed.data.tokens.refreshToken;
      },
    },
    {
      name: 'auth-refresh',
      method: 'POST',
      path: () => '/api/v1/auth/refresh',
      body: ctx => ({ refreshToken: ctx.refreshToken }),
      noAuth: true,
      expectStatus: 200,
      expectFields: ['data.accessToken', 'data.refreshToken'],
      after: (ctx, parsed) => {
        // 갱신된 토큰으로 교체 — 이후 케이스는 새 토큰을 쓴다(재발급이 실제로 유효한지도
        // 확인하는 셈: 다음 케이스가 이 토큰으로 인증에 성공해야 함).
        ctx.accessToken = parsed.data.accessToken;
      },
    },
    {
      name: 'auth-me',
      method: 'GET',
      path: () => '/api/v1/auth/me',
      expectStatus: 200,
      expectFields: ['data.userId', 'data.email', 'data.name'],
    },
  ],
};
