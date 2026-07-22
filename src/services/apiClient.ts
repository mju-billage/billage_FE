import { API_BASE_URL } from '../constants/api';

type ApiResponse<T> = {
  data: T;
  message: string;
};

type ApiErrorBody = {
  code: string;
  message: string;
};

/** 서버가 내려주는 에러 코드(예: EMAIL_ALREADY_EXISTS)를 담은 API 에러. */
export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * 공통 API 요청 함수. ApiResponse<T> 래퍼를 벗겨 data만 반환하고,
 * 실패 시 서버가 내려주는 code/message로 ApiError를 던진다.
 *
 * 세션 쿠키(JSESSIONID) 저장/전송 방식은 아직 정책 확정 전이라(계획표 6-④),
 * 우선 fetch의 기본 자격 증명 포함 옵션(credentials: 'include')에 의존한다.
 */
export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new ApiError(errorBody.code, errorBody.message);
  }

  return (body as ApiResponse<T>).data;
}
