import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import {
  BACKGROUND_PRIMARY,
  BASIC_0,
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FILL_SECONDARY_BOLD,
  FOLDER_BACKGROUND,
  FOLDER_FRONT,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import Svg, { Path } from 'react-native-svg';

// 증빙자료 앨범 그리드(`ReceiptGrid`)는 별도로 계산한다 — 폴더는 gap 16이고
// 앨범 목업은 여백 약 20/간격 약 7~8로 보여 값을 묶지 않는다.
/** 그리드 뷰 한 줄의 열 수. FolderItem 그리드 폭 계산과 호출 화면의 numColumns가 같은 값이어야 한다. */
export const FOLDER_GRID_COLUMNS = 3;
/** 그리드 열 사이 간격(dp). 시안 값 (FDR-1-PAGE-01-0). */
export const FOLDER_GRID_COLUMN_GAP = 16;
/** 그리드를 쓰는 화면들(FolderScreen, ReportLedgerSelectScreen)의 body 좌우 패딩. */
const GRID_SCREEN_HORIZONTAL_PADDING = 20;
// 화면 너비에서 좌우 패딩 20*2를 빼는 이유: 그리드를 그리는 호출 화면이 모두 body에
// paddingHorizontal: 20을 주기 때문이다. 이 값이 다른 화면에서 그리드를 쓰면 폭 계산이
// 어긋나므로 그 화면의 패딩에 맞게 이 전제를 다시 확인해야 한다.
function getGridItemWidth(windowWidth: number): number {
  return (
    (windowWidth -
      GRID_SCREEN_HORIZONTAL_PADDING * 2 -
      FOLDER_GRID_COLUMN_GAP * (FOLDER_GRID_COLUMNS - 1)) /
    FOLDER_GRID_COLUMNS
  );
}

type FolderItemKind = 'folder' | 'ledger';
type FolderItemLayout = 'grid' | 'list';

type FolderItemProps = {
  kind: FolderItemKind;
  name: string;
  subtitle: string;
  layout?: FolderItemLayout;
  selected?: boolean;
  hasItems?: boolean;
  onPress?: () => void;
};

const TabShape = ({ fill }: { fill: string }) => (
  <Svg
    width="65" // 탭의 전체 너비
    height="51" // 탭의 전체 높이
    viewBox="0 0 65 51" // SVG 내부 좌표계 정의
    style={graphicStyles.tabSvg} // 위치 설정을 위한 스타일
  >
    <Path
      d="M0,4 C0,1.79 1.79,0 4,0 L22.5,0 C26.5,0 25.87,5 28.87,5 L61,5 C63.21,5 65,6.79 65,9 V47 C65,49.21 63.21,51 61,51 H4 C1.79,51 0,49.21 0,47 Z" // 곡선 경로 정의 데이터
      fill={fill} // 색상 채우기
    />
  </Svg>
);

/** 탭 + 본체 두 겹으로 구성한 폴더 아이콘. hasItems가 true면 안에 든 내용물이 앞면 틈으로 비쳐 보인다. */
function FolderGraphic({ hasItems }: { hasItems: boolean }) {
  return (
    <View style={graphicStyles.folder}>
      <TabShape fill={FOLDER_BACKGROUND} />
      {hasItems && <View style={graphicStyles.ledgerPeek} />}
      <View style={graphicStyles.folderBody} />
    </View>
  );
}

/** 가로줄 3개를 담은 장부(문서) 아이콘. */
function LedgerGraphic() {
  return (
    <View style={graphicStyles.ledger}>
      <View style={graphicStyles.ledgerLine} />
      <View style={graphicStyles.ledgerLine} />
      <View style={graphicStyles.ledgerLine} />
    </View>
  );
}

/** 폴더/장부 항목. grid(세로형)/list(가로형) 레이아웃과 선택 상태를 지원한다. */
function FolderItem({
  kind,
  name,
  subtitle,
  layout = 'grid',
  selected = false,
  hasItems = true,
  onPress,
}: FolderItemProps) {
  const { width: windowWidth } = useWindowDimensions();
  const gridItemWidth = useMemo(() => getGridItemWidth(windowWidth), [windowWidth]);

  return (
    <Pressable
      style={[
        styles.container,
        layout === 'list' ? styles.listLayout : [styles.gridLayout, { width: gridItemWidth }],
        selected && styles.selected,
      ]}
      onPress={onPress}
    >
      {layout === 'list' ? (
        <View style={styles.iconSlot}>
          {kind === 'folder' ? (
            <FolderGraphic hasItems={hasItems} />
          ) : (
            <LedgerGraphic />
          )}
        </View>
      ) : kind === 'folder' ? (
        <FolderGraphic hasItems={hasItems} />
      ) : (
        <LedgerGraphic />
      )}
      <View
        style={
          layout === 'list' ? styles.listTextColumn : styles.gridTextColumn
        }
      >
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const graphicStyles = StyleSheet.create({
  folder: {
    width: 65,
    height: 51,
    position: 'relative', // 내부 absolute 요소의 기준점
  },
  
  // --- (New) SVG 탭 위치 설정을 위한 스타일 ---
  tabSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // -------------------------------------------

  folderBodyBackGround: {
    position: 'absolute',
    top: 3, // 탭보다 살짝 아래에서 시작하여 단차를 만듭니다.
    left: 10, // 탭과 겹치게 배치하여 사이에 빈틈이 생기지 않게 합니다.
    right: 0,
    height: 12, // 앞면 뒤로 충분히 숨겨지도록 설정합니다.
    backgroundColor: FILL_SECONDARY_BOLD,
    borderTopRightRadius: 3,
  },
  ledgerPeek: {
    position: 'absolute',
    top: 8, // 앞면(folderBody)과 동일한 위치에서 시작
    width: 62,
    left: 1.5,
    right: 0,
    height: 5, // 아주 얇게 설정하여 틈새로 보이는 것처럼 만듭니다.
    backgroundColor: FILL_NEUTRAL_SUBTLE, // 밝은 색상으로 겹침 자국을 최소화합니다.
    borderRadius: 1, // 살짝 둥글게 처리
  },
  folderBody: {
    position: 'absolute',
    top: 10, // 가장 아래쪽에서 시작하여 앞면을 덮습니다.
    height: 41, // 충분히 높게 설정하여 내용물이 보이지 않도록 합니다.
    width: 65,  
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: FOLDER_FRONT, // 투명도 대신 밝은 색상을 사용해 겹침 자국을 방지합니다.
    borderRadius: 3,
  },
  
  // (참고) 기존에 작성하셨던 문서/장부 스타일은 그대로 유지했습니다.
  ledger: {
    width: 60,
    height: 50,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: BASIC_0,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  ledgerLine: {
    height: 1,
    borderRadius: 1,
    backgroundColor: BORDER_NEUTRAL_NORMAL,
  },
  ledgerLineShort: {
    width: '70%',
  },
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
  },
  gridLayout: {
    alignItems: 'center',
  },
  listLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconSlot: {
    width: 65,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  gridTextColumn: {
    alignItems: 'center',
    marginTop: 8,
  },
  listTextColumn: {
    flex: 1,
  },
  // 12px+Bold 조합은 정식 스타일에 없어 body3+bold를 예외로 채택.
  name: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default FolderItem;
