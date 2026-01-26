'use client';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GestureResponderEvent, Text, TextProps, View, ViewProps } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createStore, StoreApi, useStore } from 'zustand';
import { Icon, IconProps } from '../ui/icon';
import { Pressable, PressableProps } from '../ui/pressable';

/** Styles */

const accordionStyle = tva({
  base: 'w-full',
  variants: {
    variant: {
      filled: 'bg-background-0 shadow-hard-2',
      unfilled: '',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
});

const accordionItemStyle = tva({
  base: '',
  parentVariants: {
    variant: {
      filled: 'bg-background-0',
      unfilled: 'bg-transparent',
    },
  },
});
const accordionTitleTextStyle = tva({
  base: 'flex-1 text-left font-JakartaBold text-typography-900',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});
const accordionIconStyle = tva({
  base: 'fill-none text-typography-900',
  parentVariants: {
    size: {
      '2xs': 'h-3 w-3',
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    },
  },
});
const accordionContentTextStyle = tva({
  base: 'font-sans text-typography-700',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});
const accordionHeaderStyle = tva({
  base: 'mx-0 my-0',
});
const accordionContentStyle = tva({
  base: 'px-4 pb-3 pt-1',
});
const accordionTriggerStyle = tva({
  base: 'w-full flex-row items-center justify-between px-4 py-3 focus:outline-none web:outline-none data-[focus-visible=true]:bg-background-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40',
});

type IAccordionProps = ViewProps & VariantProps<typeof accordionStyle>;

type IAccordionItemProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof accordionItemStyle> & {
    value: string | number;
    expandProgress?: SharedValue<boolean>;
    heightProgress?: SharedValue<number>;
  };

type IAccordionContentProps = ViewProps &
  VariantProps<typeof accordionContentStyle> & {
    animationDuration?: number;
  };

type IAccordionContentTextProps = TextProps & VariantProps<typeof accordionContentTextStyle>;

type IAccordionIconProps = VariantProps<typeof accordionIconStyle> & IconProps;

type IAccordionHeaderProps = ViewProps & VariantProps<typeof accordionHeaderStyle>;

type IAccordionTriggerProps = PressableProps & VariantProps<typeof accordionTriggerStyle>;

type IAccordionTitleTextProps = TextProps & VariantProps<typeof accordionTitleTextStyle>;

/** Context */

type IStyleContext = {
  variant: IAccordionProps['variant'];
  size: IAccordionProps['size'];
};

type StoreState = {
  isExpanded: SharedValue<boolean>;
  height: SharedValue<number>;
  value: string | number;
};

type AccordionStore = StoreState & {
  actions: {
    toggleExpanded: () => void;
    reset: (state?: Partial<StoreState>) => void;
  };
};

const StyleContext = createContext<IStyleContext>({
  variant: 'filled',
  size: 'md',
});

const AccordionStoreContext = createContext<StoreApi<AccordionStore> | null>(null);

const useStyleContext = () => useContext(StyleContext);

function useAccordionStore<T>(selector: (state: AccordionStore) => T) {
  const store = useContext(AccordionStoreContext);
  if (!store) {
    throw new Error('useAccordionStore must be used within an AccordionStoreContext.Provider');
  }
  return useStore(store, selector);
}

const useExpanded = () => useAccordionStore((state) => state.isExpanded);
const useHeight = () => useAccordionStore((state) => state.height);
const useValue = () => useAccordionStore((state) => state.value);
const useActions = () => useAccordionStore((state) => state.actions);

/** Components */

const Accordion = React.forwardRef<React.ComponentRef<typeof View>, IAccordionProps>(
  ({ className, variant = 'filled', size = 'md', ...props }, ref) => {
    return (
      <StyleContext.Provider value={{ variant, size }}>
        <View ref={ref} {...props} className={accordionStyle({ variant, class: className })} />
      </StyleContext.Provider>
    );
  }
);

const AccordionItem = React.forwardRef<React.ComponentRef<typeof View>, IAccordionItemProps>(
  ({ className, value, expandProgress, heightProgress, ...props }, ref) => {
    const { variant } = useStyleContext();
    const localExpandProgress = useSharedValue(false);
    const localHeightProgress = useSharedValue(0);

    const [store] = useState(() =>
      createStore<AccordionStore>((set, get) => ({
        isExpanded: expandProgress ?? localExpandProgress,
        height: heightProgress ?? localHeightProgress,
        value,
        actions: {
          toggleExpanded: () => {
            get().isExpanded.set((prev) => !prev);
          },
          reset: (val) => {
            if (val !== undefined) set(val);
            else {
              get().isExpanded.set(false);
            }
          },
        },
      }))
    );

    // Reset states on value change for recycling
    useEffect(() => {
      const { reset } = store.getState().actions;
      if (expandProgress) reset({ isExpanded: expandProgress });
      if (heightProgress) reset({ height: heightProgress });
      reset({ value });
    }, [store, value, expandProgress, heightProgress]);

    return (
      <AccordionStoreContext.Provider value={store}>
        <View
          ref={ref}
          {...props}
          className={accordionItemStyle({
            parentVariants: { variant },
            class: className,
          })}
        />
      </AccordionStoreContext.Provider>
    );
  }
);

const AccordionContent = React.forwardRef<React.ComponentRef<typeof View>, IAccordionContentProps>(
  function AccordionContent({ className, animationDuration: duration = 300, ...props }, ref) {
    const isExpanded = useExpanded();
    const value = useValue();
    const height = useHeight();

    const bodyStyle = useAnimatedStyle(() => ({
      height: withTiming(isExpanded.value ? height.value : 0, { duration }),
    }));

    return (
      <Animated.View
        key={`accordion-item-content-${value}`}
        pointerEvents={'box-none'}
        style={[bodyStyle, { overflow: 'hidden' }]}
      >
        <View
          {...props}
          ref={ref}
          className={accordionContentStyle({ className })}
          style={[props.style]}
          onLayout={(e) => {
            const newHeight = e.nativeEvent.layout.height;
            if (height.value !== newHeight) height.set(newHeight);
          }}
        >
          {props.children}
        </View>
      </Animated.View>
    );
  }
);

const AccordionContentText = React.forwardRef<
  React.ComponentRef<typeof Text>,
  IAccordionContentTextProps
>(function AccordionContentText({ className, ...props }, ref) {
  const { size } = useStyleContext();
  return (
    <Text
      ref={ref}
      {...props}
      className={accordionContentTextStyle({
        parentVariants: { size },
        class: className,
      })}
    />
  );
});

const AccordionIcon = React.forwardRef<React.ComponentRef<typeof Icon>, IAccordionIconProps>(
  function AccordionIcon({ size, className, ...props }, ref) {
    const { size: parentSize } = useStyleContext();

    if (typeof size === 'number') {
      return (
        <Icon
          ref={ref}
          {...props}
          className={accordionIconStyle({ class: className })}
          size={size}
        />
      );
    } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
      return <Icon ref={ref} {...props} className={accordionIconStyle({ class: className })} />;
    }
    return (
      <Icon
        ref={ref}
        {...props}
        className={accordionIconStyle({
          size,
          class: className,
          parentVariants: { size: parentSize },
        })}
      />
    );
  }
);

const AccordionHeader = React.forwardRef<React.ComponentRef<typeof View>, IAccordionHeaderProps>(
  function AccordionHeader({ className, ...props }, ref) {
    return (
      <View
        ref={ref}
        {...props}
        className={accordionHeaderStyle({
          class: className,
        })}
      />
    );
  }
);

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  IAccordionTriggerProps
>(function AccordionTrigger({ className, ...props }, ref) {
  const { toggleExpanded } = useActions();

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      props.onPress?.(e);
      toggleExpanded();
    },
    [props, toggleExpanded]
  );

  return (
    <Pressable
      ref={ref}
      {...props}
      onPress={handlePress}
      className={accordionTriggerStyle({
        class: className,
      })}
    />
  );
});
const AccordionTitleText = React.forwardRef<
  React.ComponentRef<typeof Text>,
  IAccordionTitleTextProps
>(function AccordionTitleText({ className, ...props }, ref) {
  const { size } = useStyleContext();
  return (
    <Text
      ref={ref}
      {...props}
      className={accordionTitleTextStyle({
        parentVariants: { size },
        class: className,
      })}
    />
  );
});

Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'AccordionItem';
AccordionHeader.displayName = 'AccordionHeader';
AccordionTrigger.displayName = 'AccordionTrigger';
AccordionTitleText.displayName = 'AccordionTitleText';
AccordionContentText.displayName = 'AccordionContentText';
AccordionIcon.displayName = 'AccordionIcon';
AccordionContent.displayName = 'AccordionContent';

export {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
};
