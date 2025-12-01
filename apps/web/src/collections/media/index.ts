import { CollectionConfig } from 'payload';
import { Avatars } from './Avatars';
import { IdentityImages } from './IdentityImages';
import { Images } from './Images';
import MessageMedia from './MessageMedia';
import { MilkBagImages } from './MilkBagImages';

export const MediaCollections: CollectionConfig[] = [
  MessageMedia,
  MilkBagImages,
  Images,
  IdentityImages,
  Avatars,
];

export default MediaCollections;
