import { tva } from '@gluestack-ui/nativewind-utils/tva';

const sheetContentStyle = tva({
  base: 'bg-background-0 web:pointer-events-auto web:select-none',
});

const sheetItemStyle = tva({
  base: 'flex-row items-center gap-2 rounded-sm px-4 py-3 hover:bg-background-50 active:bg-background-100 data-[focus=true]:bg-background-100 web:data-[focus-visible=true]:bg-background-100 web:data-[focus-visible=true]:outline-indicator-primary data-[disabled=true]:opacity-40 data-[disabled=true]:web:pointer-events-auto data-[disabled=true]:web:cursor-not-allowed',
});

const sheetScrollViewStyle = tva({
  base: 'h-auto w-full',
});

const sheetTriggerStyle = tva({
  base: 'flex-row items-center overflow-hidden',
});

const sheetIconStyle = tva({
  base: 'text-typography-700',
});

export {
  sheetContentStyle,
  sheetIconStyle,
  sheetItemStyle,
  sheetScrollViewStyle,
  sheetTriggerStyle,
};
