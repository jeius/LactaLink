import { getColor } from '@/lib/colors/getColor';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  icon: { height: 24, width: 24 },
  messageText: { fontFamily: 'Jakarta-Regular', fontSize: 14 },
  systemText: { fontFamily: 'Jakarta-Medium', fontSize: 12, color: getColor('typography', '700') },
  dayText: { fontFamily: 'Jakarta-SemiBold', fontSize: 12, color: getColor('typography', '900') },
  input: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 14,
    backgroundColor: getColor('background', '0'),
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxHeight: 240,
  },
});

export default styles;
