import { AnimatedPressable } from '@/components/animated/pressable';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { useForm } from '@/components/contexts/FormProvider';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ID_TYPES } from '@lactalink/enums';
import { IdentitySchema } from '@lactalink/form-schemas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRightIcon, IdCardIcon } from 'lucide-react-native';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { FlatList } from 'react-native-gesture-handler';

export default function IDVerificationType() {
  const {
    setValue,
    trigger,
    additionalState: { isLoading, refreshing = false, onRefresh },
    control,
  } = useForm<IdentitySchema>();
  const selectedType = useWatch({ control, name: 'details.idType' });

  const params = useLocalSearchParams();
  const router = useRouter();

  const { themeColors } = useTheme();
  const accentFGColor = themeColors.primary[0];
  const accentBGColor = themeColors.primary[500];

  function Header() {
    return (
      <Text className="text-center font-JakartaMedium">
        Please choose the government issued ID you&apos;d like to use to verify your identity.
      </Text>
    );
  }

  function Footer() {
    return (
      <Button onPress={handleNext} isDisabled={!selectedType || isLoading}>
        <ButtonText>Continue</ButtonText>
        <ButtonIcon as={ChevronRightIcon} />
      </Button>
    );
  }

  function onSelectType(type: IdentitySchema['details']['idType']) {
    if (type !== selectedType) {
      setValue('details.idType', type, { shouldValidate: true, shouldDirty: true });
    } else {
      // @ts-expect-error Will error if value is undefined, but that's intended for deselection
      setValue('details.idType', undefined, { shouldValidate: true, shouldDirty: true });
    }
  }

  async function handleNext() {
    const valid = await trigger('details.idType');
    if (valid) {
      router.push({ pathname: '/id-verification/personal-info', params });
    }
  }

  return (
    <SafeArea safeTop={false}>
      <FlatList
        data={Array.from(Object.values(ID_TYPES))}
        keyExtractor={(item, idx) => `${item.value}-${idx}`}
        ItemSeparatorComponent={() => <Box className="h-3" />}
        ListHeaderComponentClassName="mb-4"
        ListHeaderComponent={Header}
        ListFooterComponentStyle={{ marginTop: 32 }}
        ListFooterComponent={Footer}
        contentContainerClassName="p-5"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const isSelected = item.value === selectedType;
          return (
            <AnimatedPressable
              className="overflow-hidden rounded-2xl"
              onPress={() => onSelectType(item.value)}
              disabled={isLoading}
            >
              <Card
                variant="filled"
                className="flex-row items-center gap-2 p-3"
                style={
                  isSelected
                    ? { borderColor: accentBGColor, borderWidth: 2, backgroundColor: accentFGColor }
                    : {}
                }
              >
                {isLoading ? (
                  <ItemSkeleton />
                ) : (
                  <>
                    <Box
                      className="rounded-lg bg-background-100 p-3"
                      style={isSelected ? { backgroundColor: accentBGColor } : {}}
                    >
                      <Icon as={IdCardIcon} color={isSelected ? accentFGColor : undefined} />
                    </Box>
                    <Text className="flex-1" numberOfLines={2}>
                      {item.label}
                    </Text>
                  </>
                )}
              </Card>
            </AnimatedPressable>
          );
        }}
      />
    </SafeArea>
  );
}

function ItemSkeleton() {
  return (
    <>
      <Skeleton variant="rounded" className="h-12 w-12" />
      <Skeleton variant="rounded" className="h-6 flex-1" />
    </>
  );
}
