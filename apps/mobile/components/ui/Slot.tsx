import { Image, Pressable, Text, View } from '@rn-primitives/slot';
import { cssInterop } from 'nativewind';

const Slot = Object.assign(View, { View, Image, Pressable, Text });

cssInterop(Slot.View, { className: 'style' });
cssInterop(Slot.Image, { className: 'style' });
cssInterop(Slot.Pressable, { className: 'style' });
cssInterop(Slot.Text, { className: 'style' });

export default Slot;
