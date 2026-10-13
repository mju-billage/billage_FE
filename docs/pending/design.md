# 디자이너 확인 대기

시안만으로는 판단할 수 없어서 물어봐야 하는 것들.

---

## 1. 입력칸 단위(`원`)의 글자색

**생긴 경위** QA-006 에서 `TextField` 의 입력 글자색을
`FOREGROUND_PRIMARY`(#070A23) → `FOREGROUND_NEUTRAL_NORMAL`(#4B5563) 로
바꿨다. 시안 지적 대상은 입력 텍스트였고, 같은 줄의 `suffix` 는
건드리지 않아 `#070A23` 으로 남아 있다.

**결과** 금액 입력칸에서 숫자는 회색(#4B5563), 바로 옆 `원` 은
검정(#070A23) 으로 색이 갈린다.

**해당 화면 3곳**

- `src/screens/Dues/DuesCreateScreen.tsx:452`
- `src/screens/Dues/DuesEditScreen.tsx:270`
- `src/screens/Transactions/TransactionAmountSheet.tsx:58`

전부 `suffix="원"` 이다.

**물어볼 것** 의도한 대비인가, 아니면 `원` 도 `#4B5563` 으로 맞춰야 하나.

**맞춘다면** `src/components/Input/Text Field/TextField.tsx` 의
`styles.suffix.color` 한 줄만 바꾸면 된다.

---

## 2. Typography Style PDF 의 자간 체계 두 가지

**현상** `Typography Style.pdf` 본문 표는 `letter spacing/none ~ 4xl`
체계를 쓰는데, 같은 파일 오른쪽 여백에 `tighter -0.4 / tight -0.2 /
normal 0 / loose 0.2 / looser 0.4 / loosest 1 / expanded 1.5` 라는
다른 체계가 같이 떠 있다. 이름도 값도 다르다.

**물어볼 것** 피그마 변수로 살아 있는 쪽이 어느 것인가. 옛 스케일이
파일에 남은 것이면 지워두는 게 나중에 혼선이 없다.

**영향** 지금 코드는 본문 표(none~4xl) 기준으로 맞춰져 있고,
`Other/Button` 과 `Other/Badge` 는 피그마 실제 값을 확인해
자간 0 으로 수정했다. 당장 깨지는 건 없다.
