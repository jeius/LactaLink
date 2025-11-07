'use client';
import { useKeyboardAvoider } from '@/components/KeyboardAvoider';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useStyleContext, withStyleContext } from '@gluestack-ui/nativewind-utils/withStyleContext';
import { createTextarea } from '@gluestack-ui/textarea';
import { randomUUID } from 'expo-crypto';
import React, { useEffect, useRef, useState } from 'react';
import { FocusEvent, TextInput, View } from 'react-native';

const SCOPE = 'TEXTAREA';
const UITextarea = createTextarea({
  Root: withStyleContext(View, SCOPE),
  Input: TextInput,
});

const textareaStyle = tva({
  base: 'w-full border border-outline-500 bg-background-0 data-[focus=true]:border-indicator-primary data-[focus=true]:data-[hover=true]:border-primary-400 data-[hover=true]:border-outline-300 data-[disabled=true]:data-[hover=true]:border-outline-400 data-[disabled=true]:bg-outline-400 data-[disabled=true]:opacity-40',
  variants: {
    variant: {
      default:
        'data-[invalid=true]:border-indicator-error data-[invalid=true]:web:ring-1 data-[invalid=true]:web:ring-inset data-[invalid=true]:web:ring-indicator-error data-[invalid=true]:data-[hover=true]:border-error-400 data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-inset data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-indicator-primary data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-1 data-[invalid=true]:data-[focus=true]:data-[hover=true]:border-primary-400 data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-inset data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-indicator-error data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-1 data-[invalid=true]:data-[disabled=true]:data-[hover=true]:border-error-500 data-[focus=true]:border-indicator-primary data-[focus=true]:web:ring-1 data-[focus=true]:web:ring-inset data-[focus=true]:web:ring-indicator-primary',
    },
    size: {
      sm: 'h-20',
      md: 'h-28',
      lg: 'h-36',
      xl: 'h-44',
    },
    rounded: {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    rounded: 'xl',
  },
});

const textareaInputStyle = tva({
  base: 'flex-1 p-2 text-justify align-text-top font-sans text-typography-900 placeholder:text-typography-500 web:cursor-text web:outline-none web:outline-0 web:data-[disabled=true]:cursor-not-allowed',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
});

type ITextareaProps = React.ComponentProps<typeof UITextarea> & VariantProps<typeof textareaStyle>;

const Textarea = React.forwardRef<React.ComponentRef<typeof UITextarea>, ITextareaProps>(
  function Textarea({ className, variant, rounded, size = 'md', ...props }, ref) {
    return (
      <UITextarea
        ref={ref}
        {...props}
        className={textareaStyle({ variant, class: className, size, rounded })}
        context={{ size }}
      />
    );
  }
);

type ITextareaInputProps = React.ComponentProps<typeof UITextarea.Input> &
  VariantProps<typeof textareaInputStyle>;

const TextareaInput = React.forwardRef<
  React.ComponentRef<typeof UITextarea.Input>,
  ITextareaInputProps
>(function TextareaInput({ className, ...props }, refProp) {
  const { size: parentSize } = useStyleContext(SCOPE);

  const { onFocus, registerInput } = useKeyboardAvoider();
  const localRef = useRef<TextInput>(null);
  const [inputID, setInputID] = useState('');

  const ref = refProp || localRef;

  useEffect(() => {
    if (typeof ref !== 'function' && ref.current) {
      const inputID = `input-${randomUUID()}`;
      setInputID(inputID);

      const unregister = registerInput?.(inputID, ref.current as TextInput);
      return () => {
        unregister?.();
      };
    }
    return () => {};
  }, [ref, registerInput]);

  function handleFocus(event: FocusEvent) {
    props.onFocus?.(event);
    onFocus?.(inputID);
  }

  return (
    <UITextarea.Input
      ref={ref}
      {...props}
      className={textareaInputStyle({
        parentVariants: {
          size: parentSize,
        },
        class: className,
      })}
      onFocus={handleFocus}
    />
  );
});

Textarea.displayName = 'Textarea';
TextareaInput.displayName = 'TextareaInput';

export { Textarea, TextareaInput };
export type { ITextareaInputProps as TextareaInputProps, ITextareaProps as TextareaProps };
