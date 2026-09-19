#!/usr/bin/env node
/* eslint-env node */
/**
 * 진단용 API 호출 스크립트. 의존성 없음(Node 표준 라이브러리만).
 *
 * 왜 필요한가: curl -d '...'로 한글(비ASCII)을 보내면 Windows 셸 환경에서 인코딩이
 * 깨져 서버가 400 INVALID_REQUEST(fieldErrors 빈 배열)로 응답하는 사고가 이 세션에서
 * 이미 두 번 재발했다(2026-09-13, 보고서 생성 제목/회원가입 이름 필드) — 둘 다 서버를
 * 의심했지만 실제로는 서버가 멀쩡했다. 이 스크립트는 요청 바디를 셸 인자가 아니라
 * JSON 파일에서 읽어 `Buffer.from(JSON.stringify(body), 'utf8')`로 직접 보내므로,
 * 셸 코드페이지를 아예 거치지 않는다 — 구조적으로 같은 사고가 날 수 없다.
 *
 * 사용법:
 *   node scripts/api-call.js <METHOD> <PATH> [BODY_JSON_FILE] [옵션]
 *
 *   METHOD          GET, POST, PATCH, DELETE 등
 *   PATH            /api/v1/... 형태의 경로(BASE_URL 뒤에 그대로 붙는다)
 *   BODY_JSON_FILE  요청 바디가 될 JSON 파일 경로(UTF-8로 저장할 것, BOM 없이).
 *                   GET/DELETE처럼 바디가 없으면 생략한다.
 *
 * 옵션(환경변수):
 *   API_CALL_BASE_URL   기본값 https://52-78-148-114.nip.io
 *   API_CALL_EMAIL      로그인에 쓸 계정 이메일(기본: 공유 테스트 계정)
 *   API_CALL_PASSWORD   로그인에 쓸 계정 비밀번호
 *   API_CALL_NO_AUTH=1  로그인을 건너뛰고 Authorization 헤더 없이 호출한다
 *                       (로그인/회원가입 엔드포인트 자체를 진단할 때 쓴다)
 *
 * 예시(Git Bash에서는 MSYS_NO_PATHCONV=1을 꼭 붙일 것 — 안 붙이면 `/api/v1/...`를
 * MSYS가 로컬 파일 경로로 오인해 `C:/Program Files/Git/api/v1/...`로 바꿔버린다):
 *   MSYS_NO_PATHCONV=1 node scripts/api-call.js GET /api/v1/groups
 *   MSYS_NO_PATHCONV=1 node scripts/api-call.js POST /api/v1/groups/5/reports scratch/report-body.json
 *   MSYS_NO_PATHCONV=1 API_CALL_NO_AUTH=1 node scripts/api-call.js POST /api/v1/auth/signup scratch/signup-body.json
 *   (PowerShell에는 이 문제가 없다 — MSYS_NO_PATHCONV은 Git Bash 전용.)
 *
 * 출력: 요청 URL/메서드/바디(+ 바이트 길이) → 응답 상태코드/헤더/바디 원문.
 * 바이트 길이를 항상 찍는 게 핵심이다 — 한글 텍스트가 예상 바이트 수(글자당 3바이트)와
 * 다르면 인코딩 사고를 응답을 보기도 전에 눈으로 잡을 수 있다.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.API_CALL_BASE_URL || 'https://52-78-148-114.nip.io';
const DEFAULT_EMAIL = 'billage.verify.dues.test@example.com';
const DEFAULT_PASSWORD = 'Billage1!Verify';



function rawRequest(method, urlStr, bodyBuffer, extraHeaders) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const headers = Object.assign({}, extraHeaders);
    if (bodyBuffer) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
      headers['Content-Length'] = bodyBuffer.length;
    }
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method,
        headers,
        // 개발 서버가 자체 서명 인증서를 쓸 수 있어 curl -k와 동등하게 둔다.
        rejectUnauthorized: false,
      },
      res => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const bodyText = Buffer.concat(chunks).toString('utf8');
          resolve({ statusCode: res.statusCode, headers: res.headers, bodyText });
        });
      },
    );
    req.on('error', reject);
    if (bodyBuffer) {
      req.write(bodyBuffer);
    }
    req.end();
  });
}

function printRequest(method, fullUrl, bodyObj, bodyBuffer) {
  console.log('--- 요청 ---');
  console.log(`${method} ${fullUrl}`);
  if (bodyObj !== undefined) {
    console.log('바디:', JSON.stringify(bodyObj, null, 2));
    console.log(`바디 바이트 길이: ${bodyBuffer.length}`);
  }
}

function printResponse(result) {
  console.log('--- 응답 ---');
  console.log(`상태코드: ${result.statusCode}`);
  console.log('헤더:', JSON.stringify(result.headers, null, 2));
  console.log('바디 원문:', result.bodyText);
  try {
    const parsed = JSON.parse(result.bodyText);
    console.log('바디(파싱):', JSON.stringify(parsed, null, 2));
  } catch {
    // 바디가 JSON이 아니면(204 등) 그냥 원문만 보여준다.
  }
}

async function login(email, password) {
  const bodyObj = { email, password };
  const bodyBuffer = Buffer.from(JSON.stringify(bodyObj), 'utf8');
  const fullUrl = `${BASE_URL}/api/v1/auth/login`;
  printRequest('POST', fullUrl, bodyObj, bodyBuffer);
  const result = await rawRequest('POST', fullUrl, bodyBuffer, {});
  printResponse(result);
  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`로그인 실패: ${result.statusCode}`);
  }
  const parsed = JSON.parse(result.bodyText);
  return parsed.data.tokens.accessToken;
}

async function main() {
  const [, , method, apiPath, bodyFile] = process.argv;
  if (!method || !apiPath) {
    console.error('사용법: node scripts/api-call.js <METHOD> <PATH> [BODY_JSON_FILE]');
    process.exit(1);
  }

  let accessToken;
  if (process.env.API_CALL_NO_AUTH !== '1') {
    const email = process.env.API_CALL_EMAIL || DEFAULT_EMAIL;
    const password = process.env.API_CALL_PASSWORD || DEFAULT_PASSWORD;
    console.log(`[로그인] ${email}`);
    accessToken = await login(email, password);
    console.log('[로그인] 성공, accessToken 확보\n');
  }

  let bodyObj;
  let bodyBuffer;
  if (bodyFile) {
    const filePath = path.resolve(bodyFile);
    const fileText = fs.readFileSync(filePath, 'utf8');
    bodyObj = JSON.parse(fileText);
    bodyBuffer = Buffer.from(JSON.stringify(bodyObj), 'utf8');
  }

  const fullUrl = `${BASE_URL}${apiPath}`;
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  printRequest(method.toUpperCase(), fullUrl, bodyObj, bodyBuffer);
  const result = await rawRequest(method.toUpperCase(), fullUrl, bodyBuffer, headers);
  printResponse(result);
}

if (require.main === module) {
  main().catch(error => {
    console.error('실패:', error);
    process.exit(1);
  });
}

// api-verify.js가 로그인/원시 호출 로직을 재사용한다 — 두 스크립트가 같은 curl-셸-인코딩
// 함정을 두 번 겪지 않도록 요청 바디 처리(Buffer.from(..., 'utf8')) 경로를 하나로 묶는다.
module.exports = { rawRequest, login, BASE_URL, DEFAULT_EMAIL, DEFAULT_PASSWORD };
