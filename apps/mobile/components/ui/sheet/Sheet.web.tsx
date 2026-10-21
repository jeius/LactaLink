import { cssInterop } from 'nativewind';
import React, { ComponentPropsWithoutRef, useImperativeHandle, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import type { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';

type SheetRef = TrueSheet;

const Sheet = React.forwardRef<SheetRef, TrueSheetProps>(function WebSheet(props, ref) {
  const [visible, setVisible] = useState(false);

  const present = async () => {
    setVisible(true);
    props.onDidPresent?.({} as never);
  };
  const dismiss = async () => {
    setVisible(false);
    props.onDidDismiss?.({} as never);
  };

  useImperativeHandle(ref, () => ({ present, dismiss } as unknown as TrueSheet));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={dismiss} />
        <View
          style={StyleSheet.flatten([
            styles.content,
            { backgroundColor: props.backgroundColor || '#fff' },
            props.style,
          ])}
        >
          {React.isValidElement(props.header) ? props.header : null}
          <View style={styles.body}>{props.children}</View>
          {React.isValidElement(props.footer) ? props.footer : null}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backdrop: { zIndex: 1 },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    width: '100%',
    height: 360,
    maxHeight: '82%',
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingTop: 12,
    boxShadow: '0 -8px 28px rgba(0,0,0,0.18)',
  },
  body: { flex: 1, minHeight: 80 },
});

const StyledSheet = cssInterop(Sheet, {
  className: 'style',
  headerClassName: 'headerStyle',
  footerClassName: 'footerStyle',
  backgroundColorClassName: {
    target: 'backgroundColor',
    nativeStyleToProp: { backgroundColor: true },
  },
});

type SheetProps = ComponentPropsWithoutRef<typeof StyledSheet>;
export type { SheetProps, SheetRef };
export default StyledSheet;
