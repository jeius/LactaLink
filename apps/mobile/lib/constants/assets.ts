import { DeliveryMode } from '@lactalink/types';
import { FC } from 'react';
import { SvgProps } from 'react-native-svg';

export const ICON_ASSETS = {
  meetUp: require('../../assets/icons/2x/meet_up.png'),
  locationPin: require('../../assets/icons/2x/location_pin.png'),
  milkBasket: require('../../assets/icons/2x/milk_basket.png'),
  pickUp: require('../../assets/icons/2x/pick_up.png'),
  scooterWithBasket: require('../../assets/icons/2x/scooter_with_basket.png'),
  accountVerified: require('../../assets/icons/2x/account_verified.png'),
  brokenHeart: require('../../assets/icons/2x/broken_heart.png'),
  office: require('../../assets/icons/2x/company_office.png'),
  couple: require('../../assets/icons/2x/couple.png'),
  divorced: require('../../assets/icons/2x/divorced.png'),
  female: require('../../assets/icons/2x/female.png'),
  genderOther: require('../../assets/icons/2x/gender_other.png'),
  google: require('../../assets/icons/2x/google.png'),
  heart: require('../../assets/icons/2x/heart.png'),
  home: require('../../assets/icons/2x/home.png'),
  information: require('../../assets/icons/2x/information.png'),
  list: require('../../assets/icons/2x/list.png'),
  male: require('../../assets/icons/2x/male.png'),
  phone: require('../../assets/icons/2x/phone.png'),
  receiveMilk: require('../../assets/icons/2x/receive_milk.png'),
  sendMilk: require('../../assets/icons/2x/send_milk.png'),
  separated: require('../../assets/icons/2x/separated.png'),
  single: require('../../assets/icons/2x/single.png'),
  townHall: require('../../assets/icons/2x/town_hall.png'),
  unknownBuilding: require('../../assets/icons/2x/unknown_building.png'),
  widowed: require('../../assets/icons/2x/widowed.png'),
  basicLocationPin: require('../../assets/icons/2x/basic_location_pin.png'),
  milkBottle: require('../../assets/icons/2x/milk_bottle.png'),
};

export const IMAGE_ASSETS = {
  individual: require('../../assets/images/1x/individual_type.png'),
  'individual_0.75x': require('../../assets/images/0.75x/individual_type.png'),
  hospital: require('../../assets/images/1x/hospital_type.png'),
  'hospital_0.75x': require('../../assets/images/0.75x/hospital_type.png'),
  milkBank: require('../../assets/images/1x/milk_bank_type.png'),
  'milkBank_0.75x': require('../../assets/images/0.75x/milk_bank_type.png'),
  signIn: require('../../assets/images/1x/sign_in.png'),
  signUp: require('../../assets/images/1x/sign_up.png'),
  forgotPassword: require('../../assets/images/1x/forgot_password.png'),
  verification: require('../../assets/images/1x/phone_verification.png'),
  admin: require('../../assets/images/1x/admin_sign_up.png'),
  onboarding1: require('../../assets/images/1x/onboarding1.png'),
  onboarding2: require('../../assets/images/1x/onboarding2.png'),
  onboarding3: require('../../assets/images/1x/onboarding3.png'),
  onboarding4: require('../../assets/images/1x/onboarding4.png'),
  error404: require('../../assets/images/1x/error_404.png'),
  'error404_0.75x': require('../../assets/images/0.75x/error_404.png'),
  noData: require('../../assets/images/1x/no_data.png'),
  'noData_0.75x': require('../../assets/images/0.75x/no_data.png'),
  deliveryGuy: require('../../assets/images/1x/delivery_guy.png'),
  'deliveryGuy_0.75x': require('../../assets/images/0.75x/delivery_guy.png'),
  pumpingMilk: require('../../assets/images/1x/pumping_milk.png'),
  'pumpingMilk_0.75x': require('../../assets/images/0.75x/pumping_milk.png'),
  idVerification: require('../../assets/images/1x/verify_identity.png'),
  'idVerification_0.75x': require('../../assets/images/0.75x/verify_identity.png'),
  emailReceived: require('../../assets/images/1x/email_received.png'),
  'emailReceived_0.75x': require('../../assets/images/0.75x/email_received.png'),
};

export const LOGO_ASSETS = {
  logo_light: require('../../assets/logo/splash_icon_light.png'),
  logo_dark: require('../../assets/logo/splash_icon_dark.png'),
};

export const SVG_ASSETS = {
  milkBasket: require('../../assets/svgs/milk_basket.svg'),
  donateMilk: require('../../assets/svgs/hand_with_basket.svg'),
};

export const DP_METHOD_ICONS: Record<DeliveryMode, FC<SvgProps>> = {
  PICKUP: require('../../assets/svgs/pick_up.svg'),
  MEETUP: require('../../assets/svgs/meet_up.svg'),
  DELIVERY: require('../../assets/svgs/scooter_with_basket.svg'),
};

export const LOTTIE_ASSETS = {
  babyLoader: require('@/assets/lottie/loader.zip'),
  mapPin: require('@/assets/lottie/map_pin.zip'),
  timeLoader: require('@/assets/lottie/loading.zip'),
  orderPacked: require('@/assets/lottie/order_packed.zip'),
  areaMap: require('@/assets/lottie/area_map.zip'),
  success: require('@/assets/lottie/success.zip'),
  receivePackage: require('@/assets/lottie/receive_order.zip'),
};
