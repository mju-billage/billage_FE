import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BORDER_NEUTRAL } from '../../constants/colors';

const PLUS_ICON = require('../../assets/icons/action/Plus.png');

type AccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

/** 제목을 누르면 본문이 펼쳐지는 아코디언. */
function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setOpen(!open)}>
        <Text style={styles.title}>{title}</Text>
        <Image
          source={PLUS_ICON}
          style={[styles.icon, open && styles.iconOpen]}
        />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: '#495057',
  },
  iconOpen: {
    transform: [{ rotate: '45deg' }],
  },
  body: {
    paddingBottom: 14,
  },
});

export default Accordion;
