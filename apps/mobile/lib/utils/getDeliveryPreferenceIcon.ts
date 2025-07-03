import { DeliveryPreference } from '@lactalink/types';
import { Asset } from 'expo-asset';
import { getIconAsset } from '../stores';

export function getDeliveryPreferenceIcon(
  preferredMode: DeliveryPreference['preferredMode'][number]
): Asset {
  switch (preferredMode) {
    case 'DELIVERY':
      return getIconAsset('scooterWithBasket');
    case 'PICKUP':
      return getIconAsset('pickUp');
    case 'MEETUP':
    default:
      return getIconAsset('meetUp');
  }
}
