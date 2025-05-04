export type Shade =
  | '0'
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

export type ColorCategory =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'typography'
  | 'outline'
  | 'background'
  | 'indicator';

export type ColorShades = {
  [key in Shade]?: string;
};

export type SpecialVariants = {
  [variant: string]: string;
};

export type ColorPalette = ColorShades & SpecialVariants;

export type ThemeMode = {
  [key in ColorCategory]: ColorPalette;
};

export type ColorsConfig = Record<'light' | 'dark', ThemeMode>;
