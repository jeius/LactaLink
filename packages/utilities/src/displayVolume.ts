export function displayVolume(volume: number): string {
  if (volume >= 1000) {
    return `${Number((volume / 1000).toFixed(2)).toLocaleString()} L`;
  } else {
    return `${volume.toLocaleString()} mL`;
  }
}
