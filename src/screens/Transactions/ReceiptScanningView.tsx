/** @screen ADD-3-PAGE-01-0 영수증 스캔 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import * as fileService from '../../services/fileService';
import * as ocrService from '../../services/ocrService';
import { ApiError } from '../../services/apiClient';
import type { PickedImage } from '../../utils/imagePicker';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
  GREY_800,
} from '../../constants/colors';

const PREVIEW_SIZE = 240;

/**
 * 스캔 결과. 인식에 성공하면 `result`가 오고, 실패해도 **업로드된 `fileId`는 남는다** —
 * 사용자가 "인식은 안 됐지만 증빙으로는 첨부"할 수 있어야 해서 실패 쪽에도 실어 보낸다.
 */
export type ScanOutcome =
  | { kind: 'ok'; result: ocrService.OcrResult; fileId: number; previewUri: string }
  | { kind: 'notRecognized'; fileId: number; previewUri: string }
  | { kind: 'rateLimited' }
  | { kind: 'failed' };

type ReceiptScanningViewProps = {
  image: PickedImage;
  onComplete: (outcome: ScanOutcome) => void;
};

/**
 * 촬영한 영수증을 올리고 인식하는 동안 보여주는 화면.
 *
 * 업로드(`POST /files`)와 인식(`POST /files/{fileId}/ocr`)이 서버에서 나뉘어 있어
 * 여기서도 두 번 부른다. 나뉜 덕에 인식이 실패해도 파일이 남아 증빙으로 쓸 수 있다.
 *
 * 예전엔 `utils/mockOcr.ts`가 1.5초 뒤 무작위 결과를 돌려줬다(서버 미구현 시절의 임시
 * 장치). 서버가 2026-09-21에 배포되면서 실제 호출로 바꿨고, 이제 애니메이션은 고정
 * 시간이 아니라 **실제 응답이 올 때까지** 돈다.
 */
function ReceiptScanningView({ image, onComplete }: ReceiptScanningViewProps) {
  const sweep = useRef(new Animated.Value(0)).current;
  /** 언마운트 뒤 늦게 도착한 응답으로 화면을 전환하지 않기 위한 표식. */
  const alive = useRef(true);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    scanReceipt(image).then(outcome => {
      if (alive.current) {
        onComplete(outcome);
      }
    });

    return () => {
      alive.current = false;
      animation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PREVIEW_SIZE],
  });

  return (
    <View style={styles.container}>
      <View style={styles.previewBox}>
        <Animated.View
          style={[styles.sweepLine, { transform: [{ translateY }] }]}
        />
      </View>
    </View>
  );
}

/**
 * 업로드 → 인식. 인식 단계의 실패는 코드로 갈라 돌려준다.
 *
 * `OCR_RESULT_EMPTY`는 오류가 아니라 "못 읽었다"는 정상 분기이고(스캔 실패 화면),
 * `INVALID_OCR_FILE`도 다시 찍으면 되는 일이라 같은 화면으로 보낸다.
 * `OCR_RATE_LIMITED`만 따로 가른다 — **자동 재시도를 유도하면 안 되기 때문이다**
 * (서버가 외부 OCR을 건당 과금으로 부른다).
 */
async function scanReceipt(image: PickedImage): Promise<ScanOutcome> {
  let fileId: number;
  try {
    const uploaded = await fileService.uploadFile(
      image.uri,
      image.fileName,
      image.type,
      'RECEIPT',
    );
    fileId = Number(uploaded.id);
  } catch {
    // 올리지도 못했으면 남은 파일이 없다 — 증빙으로 붙일 것도 없다.
    return { kind: 'failed' };
  }

  try {
    const result = await ocrService.recognizeReceipt(String(fileId));
    return { kind: 'ok', result, fileId, previewUri: image.uri };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === ocrService.OCR_RATE_LIMITED) {
        return { kind: 'rateLimited' };
      }
      if (
        error.code === ocrService.OCR_RESULT_EMPTY ||
        error.code === ocrService.INVALID_OCR_FILE
      ) {
        return { kind: 'notRecognized', fileId, previewUri: image.uri };
      }
    }
    // 장애(OCR_PROCESSING_FAILED)나 네트워크 문제. 파일은 올라갔으니 증빙으로는 쓸 수 있다.
    return { kind: 'notRecognized', fileId, previewUri: image.uri };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREY_800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBox: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 12,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    overflow: 'hidden',
  },
  sweepLine: {
    width: '100%',
    height: 2,
    backgroundColor: FOREGROUND_SECONDARY,
  },
});

export default ReceiptScanningView;
