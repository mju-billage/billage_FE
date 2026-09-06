/**
 * 증빙자료 앨범(File 도메인 `GET /groups/{groupId}/receipts`) 응답 항목. 파일 자체가
 * 아니라 파일+내역+장부를 합쳐 놓은 조회 전용 뷰다 — File.txt "3. 증빙자료 앨범 조회"에
 * 별도 단건 조회 API가 없어(목록에서만 받는다), 상세 화면은 이 항목을 그대로
 * navigation params로 넘겨받는다(재조회하지 않음).
 */
export type Receipt = {
  fileId: string;
  /** 인증이 필요한 절대 URL(File.txt "인증이 필요한 경로") — 원본 그대로이며 썸네일용
   * 축소본이 따로 없다(File.txt "이미지 압축은 하지 않습니다"). */
  fileUrl: string;
  entryId: string;
  entryTitle: string;
  /** 'YYYY-MM-DD', 내역 발생일. */
  occurredOn: string;
  ledgerId: string;
  ledgerName: string;
};
