// react-native/react-native의 Text·TextInput은 함수 컴포넌트라 React 19에서
// Text.defaultProps 같은 런타임 오버라이드가 더 이상 동작하지 않는다(React 19에서
// 함수 컴포넌트 defaultProps 지원 제거됨). 그래서 앱 기본 폰트는 컴파일 타임에
// <Text>/<TextInput> JSX에 style={[{fontFamily: ...}, 기존 style]}를 주입해서 적용한다.
const DEFAULT_FONT_FAMILY = 'Pyeojin Gothic';
const TARGET_COMPONENTS = new Set(['Text', 'TextInput']);

module.exports = function defaultFontPlugin({ types: t }) {
  return {
    name: 'default-font',
    visitor: {
      JSXOpeningElement(path) {
        const name = path.node.name;
        if (name.type !== 'JSXIdentifier' || !TARGET_COMPONENTS.has(name.name)) {
          return;
        }

        const defaultStyle = t.objectExpression([
          t.objectProperty(
            t.identifier('fontFamily'),
            t.stringLiteral(DEFAULT_FONT_FAMILY),
          ),
        ]);

        const styleAttr = path.node.attributes.find(
          attr => t.isJSXAttribute(attr) && attr.name.name === 'style',
        );

        if (!styleAttr) {
          path.node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('style'),
              t.jsxExpressionContainer(defaultStyle),
            ),
          );
          return;
        }

        if (
          !styleAttr.value ||
          !t.isJSXExpressionContainer(styleAttr.value) ||
          t.isJSXEmptyExpression(styleAttr.value.expression)
        ) {
          return;
        }

        const existingExpression = styleAttr.value.expression;
        styleAttr.value = t.jsxExpressionContainer(
          t.arrayExpression([defaultStyle, existingExpression]),
        );
      },
    },
  };
};
