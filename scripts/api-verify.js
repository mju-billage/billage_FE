#!/usr/bin/env node
/* eslint-env node */
/**
 * API 연동 전수 실호출 검증 엔진. `scripts/api-call.js`의 `rawRequest`/`login`을
 * 그대로 재사용한다(요청 바디는 항상 `Buffer.from(JSON.stringify(...), 'utf8')` 경로로
 * 나간다 — 셸 인코딩 사고를 구조적으로 차단하는 이유는 `api-call.js` 헤더 주석 참고).
 *
 * 목적: `docs/api-wiring.md`의 Swagger 77개 엔드포인트 각각에 대해 "스키마 대조"가
 * 아니라 "실제로 호출해서 기대한 응답이 오는가"를 확인한다.
 *
 * 케이스 파일은 이 스크립트가 아니라 `scripts/api-verify-cases/*.js`에 단계별로
 * 분리한다(01-auth.js, 02-group.js, ...) — 나중에 케이스를 추가하기 쉽게, 그리고
 * 한 단계씩 돌려보고 다음 단계로 넘어갈 수 있게.
 *
 * 케이스 파일은 `module.exports = { stage: '이름', cases: [...] }` 형태이고, 각
 * case는 다음 필드를 가진다:
 *   name          고유 식별자(로그 표시용, 예: 'group-get-detail')
 *   method        'GET'/'POST'/'PATCH'/'DELETE'
 *   path(ctx)     실제 경로를 반환하는 함수 — ctx에 쌓인 값(groupId, ledgerId 등)을 씀
 *   body(ctx)     요청 바디 객체를 반환하는 함수(옵션, GET/DELETE는 생략)
 *   noAuth        true면 로그인 토큰을 안 붙인다(로그인 자체를 검증하는 케이스용)
 *   expectStatus  기대 상태코드(숫자 또는 배열)
 *   expectFields  응답 바디(파싱된 JSON)에 있어야 하는 경로 배열(옵션, dot-path,
 *                 예: 'data.ledgerId' — 최상위가 `data`가 아니면 그냥 필드명)
 *   after(ctx, parsedBody, statusCode)  성공 시 ctx에 값을 채워 다음 케이스가 쓸 수
 *                 있게 한다(옵션)
 *   skip          문자열이면 호출 자체를 건너뛰고 SKIP으로 기록(사유로 그 문자열을 씀)
 *
 * 사용법:
 *   node scripts/api-verify.js scripts/api-verify-cases/01-auth.js
 *   node scripts/api-verify.js scripts/api-verify-cases/*.js   (여러 단계 한 번에, 쉘이 글롭 확장)
 *
 * 실패해도 멈추지 않고 끝까지 돈다. 마지막에 파일별 + 전체 PASS/FAIL/SKIP 집계를 찍는다.
 */

const path = require('path');
const { rawRequest, login, BASE_URL, DEFAULT_EMAIL, DEFAULT_PASSWORD } = require('./api-call.js');

function getByPath(obj, dotPath) {
  return dotPath.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    // 'items[0]' 같은 배열 인덱스 표기 지원
    const match = key.match(/^([^[]+)\[(\d+)\]$/);
    if (match) {
      const arr = acc[match[1]];
      return Array.isArray(arr) ? arr[Number(match[2])] : undefined;
    }
    return acc[key];
  }, obj);
}

async function runCase(ctx, testCase, results) {
  const label = `${testCase.method} ${typeof testCase.path === 'function' ? '(동적 경로)' : testCase.path}`;

  if (testCase.skip) {
    console.log(`SKIP  ${testCase.name} — ${testCase.skip}`);
    results.push({ name: testCase.name, outcome: 'SKIP', reason: testCase.skip });
    return;
  }

  // 실제 HTTP 호출 없이 ctx만 조작하는 케이스(예: 다른 계정으로 토큰 교체) — 여러
  // 계정 권한(총무/일반)이 걸린 시나리오(승인 대기 등)를 검증하려면 필요하다.
  if (testCase.virtual) {
    try {
      await testCase.virtual(ctx);
      console.log(`PASS  ${testCase.name} — (가상 단계, HTTP 호출 없음)`);
      results.push({ name: testCase.name, outcome: 'PASS' });
    } catch (error) {
      console.log(`FAIL  ${testCase.name} — 가상 단계 예외: ${error.message}`);
      results.push({ name: testCase.name, outcome: 'FAIL', reason: error.message });
    }
    return;
  }

  let resolvedPath;
  let bodyObj;
  try {
    resolvedPath = typeof testCase.path === 'function' ? testCase.path(ctx) : testCase.path;
    bodyObj = typeof testCase.body === 'function' ? testCase.body(ctx) : testCase.body;
  } catch (error) {
    console.log(`FAIL  ${testCase.name} — 케이스 준비 중 예외: ${error.message}`);
    results.push({ name: testCase.name, outcome: 'FAIL', reason: `준비 예외: ${error.message}` });
    return;
  }

  const bodyBuffer = bodyObj !== undefined ? Buffer.from(JSON.stringify(bodyObj), 'utf8') : undefined;
  const fullUrl = `${BASE_URL}${resolvedPath}`;
  const headers = {};
  if (!testCase.noAuth && ctx.accessToken) {
    headers.Authorization = `Bearer ${ctx.accessToken}`;
  }

  let result;
  try {
    result = await rawRequest(testCase.method, fullUrl, bodyBuffer, headers);
  } catch (error) {
    console.log(`FAIL  ${testCase.name} — 네트워크 오류: ${error.message}`);
    results.push({ name: testCase.name, outcome: 'FAIL', reason: `네트워크 오류: ${error.message}` });
    return;
  }

  const expectStatuses = Array.isArray(testCase.expectStatus)
    ? testCase.expectStatus
    : [testCase.expectStatus];
  const statusOk = expectStatuses.includes(result.statusCode);

  let parsedBody;
  try {
    parsedBody = JSON.parse(result.bodyText);
  } catch {
    parsedBody = undefined;
  }

  const missingFields = [];
  if (statusOk && testCase.expectFields) {
    for (const fieldPath of testCase.expectFields) {
      const value = getByPath(parsedBody, fieldPath);
      if (value === undefined) {
        missingFields.push(fieldPath);
      }
    }
  }

  if (statusOk && missingFields.length === 0) {
    console.log(`PASS  ${testCase.name} — ${label} → ${result.statusCode}`);
    results.push({ name: testCase.name, outcome: 'PASS' });
    if (testCase.after) {
      try {
        testCase.after(ctx, parsedBody, result.statusCode);
      } catch (error) {
        console.log(`      (경고) after() 훅 실패: ${error.message}`);
      }
    }
    return;
  }

  const reason = !statusOk
    ? `기대 상태코드 ${expectStatuses.join('|')}, 실제 ${result.statusCode}`
    : `응답에 필드 누락: ${missingFields.join(', ')}`;
  console.log(`FAIL  ${testCase.name} — ${label} — ${reason}`);
  console.log(`      요청 바디: ${bodyObj !== undefined ? JSON.stringify(bodyObj) : '(없음)'}`);
  console.log(`      응답 원문: ${result.bodyText}`);
  results.push({
    name: testCase.name,
    outcome: 'FAIL',
    reason,
    requestBody: bodyObj,
    responseBody: result.bodyText,
    statusCode: result.statusCode,
  });
}

async function main() {
  const stageFiles = process.argv.slice(2);
  if (stageFiles.length === 0) {
    console.error('사용법: node scripts/api-verify.js <케이스파일.js> [<케이스파일2.js> ...]');
    process.exit(1);
  }

  const email = process.env.API_CALL_EMAIL || DEFAULT_EMAIL;
  const password = process.env.API_CALL_PASSWORD || DEFAULT_PASSWORD;
  console.log(`[로그인] ${email}`);
  const accessToken = await login(email, password);
  console.log('[로그인] 성공\n');

  const ctx = { accessToken, groupId: process.env.API_VERIFY_GROUP_ID || '6' };
  const allResults = [];

  for (const stageFile of stageFiles) {
    const resolved = path.resolve(stageFile);
    delete require.cache[resolved];
    const mod = require(resolved);
    console.log(`\n=== ${mod.stage || stageFile} ===`);
    const stageResults = [];
    for (const testCase of mod.cases) {
      await runCase(ctx, testCase, stageResults);
    }
    const pass = stageResults.filter(r => r.outcome === 'PASS').length;
    const fail = stageResults.filter(r => r.outcome === 'FAIL').length;
    const skip = stageResults.filter(r => r.outcome === 'SKIP').length;
    console.log(`--- ${mod.stage || stageFile} 집계: PASS ${pass} / FAIL ${fail} / SKIP ${skip} ---`);
    allResults.push(...stageResults);
  }

  const totalPass = allResults.filter(r => r.outcome === 'PASS').length;
  const totalFail = allResults.filter(r => r.outcome === 'FAIL').length;
  const totalSkip = allResults.filter(r => r.outcome === 'SKIP').length;
  console.log(`\n=== 전체 집계: PASS ${totalPass} / FAIL ${totalFail} / SKIP ${totalSkip} (총 ${allResults.length}건) ===`);

  if (totalFail > 0) {
    console.log('\n--- FAIL 상세 ---');
    for (const r of allResults.filter(x => x.outcome === 'FAIL')) {
      console.log(`\n[${r.name}] ${r.reason}`);
      if (r.requestBody !== undefined) console.log(`  요청: ${JSON.stringify(r.requestBody)}`);
      if (r.responseBody !== undefined) console.log(`  응답: ${r.responseBody}`);
    }
  }
}

main().catch(error => {
  console.error('실패:', error);
  process.exit(1);
});
