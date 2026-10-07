import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const PLUS_ICON = require('../../../assets/icons/action/Plus.png');
const MINUS_ICON = require('../../../assets/icons/action/Minus.png');

type AccordionProps = {
  title: string;
  items: string[];
  defaultOpen?: boolean;
};

function Accordion({ title, items, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setOpen(!open)}>
        <Text style={styles.title}>{title}</Text>
        {open ? (
          <Image source={MINUS_ICON} style={styles.icon} />
        ) : (
          <Image source={PLUS_ICON} style={styles.icon} />
        )}
      </Pressable>
      {open && (
        <View style={styles.body}>
          {items.map((item, index) => (
            <Text key={index} style={styles.item}>
              {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL_NORMAL,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  minusIcon: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  body: {
    paddingBottom: 14,
    gap: 20,
  },
  item: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
});

export default Accordion;
