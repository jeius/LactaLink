/**
 * Determines whether the provided object represents a placeholder by checking if its `id` property starts with `'placeholder'`.
 *
 * @param value - An object containing an `id` property of type `string`.
 * @returns `true` if the `id` starts with `'placeholder'`, otherwise `false`.
 */
export function isPlaceHolderData(value: { id: string }): boolean {
  return value.id.startsWith('placeholder');
}
