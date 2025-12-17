import { ImageSchema } from '@lactalink/form-schemas';
import { extractImageData } from '@lactalink/utilities/extractors';
import { EditIcon, MinusIcon, PlusCircleIcon } from 'lucide-react-native';
import React, { RefObject, useCallback, useMemo, useRef } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { AnimatedPressable } from '../animated/pressable';
import { ImageUpload, ImageUploadOptions, ImageUploadRef } from '../ImageUpload';
import { SingleImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';
import { Button, ButtonIcon } from '../ui/button';
import { Card } from '../ui/card';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { VStack } from '../ui/vstack';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface ImageListProps {
  data: ImageSchema[];
  isDisabled?: boolean;
  limit?: number;
  uploadRef: RefObject<ImageUploadRef | null>;
}

interface SingleImageProps {
  data: ImageSchema;
  isDisabled?: boolean;

  uploadRef: RefObject<ImageUploadRef | null>;
}

interface ImageFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  options?: ImageUploadOptions;
}

export function ImageField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  options,
  contentPosition = 'last',
  ...props
}: ImageFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onBlur, onChange, disabled },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const imageUploadRef = useRef<ImageUploadRef>(null);

  const disabledFields = isDisabled || isSubmitting || disabled;
  const isArray = Array.isArray(value);
  const images = useMemo<ImageSchema[] | undefined | null>(
    () => (isArray ? value : value && [value]),
    [value, isArray]
  );

  const handleChange = useCallback(
    (values: ImageSchema[]) => {
      if (isArray) {
        onChange(values);
      } else {
        const value = values[0];
        onChange(values.length > 0 ? value : null);
      }
    },
    [isArray, onChange]
  );

  const render = useCallback(
    (values: ImageSchema[]) => {
      if (isArray) {
        const limit = options?.selectionLimit || undefined;
        return (
          <ImageList
            data={values}
            isDisabled={disabledFields}
            uploadRef={imageUploadRef}
            limit={limit}
          />
        );
      } else {
        const image = values[0];
        return (
          image && (
            <SingleImage data={image} isDisabled={disabledFields} uploadRef={imageUploadRef} />
          )
        );
      }
    },
    [isArray, disabledFields, options?.selectionLimit]
  );

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      error={error}
      isDisabled={disabledFields}
    >
      {isLoading ? (
        <Skeleton variant="rounded" className="h-10" />
      ) : (
        <ImageUpload
          {...options}
          ref={imageUploadRef}
          value={images}
          onChange={handleChange}
          isDisabled={disabledFields}
          onBlur={onBlur}
          containerClassName="h-40 mt-2"
          render={render}
        />
      )}
    </FieldWrapper>
  );
}

function SingleImage({ data, isDisabled, uploadRef }: SingleImageProps) {
  const actions = [
    { icon: EditIcon, onPress: () => uploadRef.current?.upload(), action: 'muted' },
    { icon: MinusIcon, onPress: () => uploadRef.current?.remove(), action: 'negative' },
  ] as const;

  return (
    <Box>
      <SingleImageViewer
        image={extractImageData(data)}
        style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden' }}
      />
      <Box className="absolute inset-y-0" style={{ right: 0 }}>
        <VStack space="md" className="grow overflow-hidden rounded-r-xl p-1">
          <Box className="absolute inset-0 bg-background-900" style={{ opacity: 0.4 }} />
          {actions.map(({ icon, onPress, action }, index) => (
            <Button
              key={index}
              action={action}
              className="h-fit w-fit p-3"
              onPress={onPress}
              isDisabled={isDisabled}
            >
              <ButtonIcon as={icon} />
            </Button>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

function ImageList({ isDisabled, data, limit, uploadRef }: ImageListProps) {
  const isBelowLimit = limit ? data.length < limit : true;
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <Box className="w-2" />}
      ListFooterComponentClassName="ml-2"
      ListFooterComponent={() =>
        isBelowLimit && (
          <AnimatedPressable
            layout={LinearTransition}
            entering={FadeIn}
            exiting={FadeOut}
            disabled={isDisabled}
            className="relative h-40 w-32 items-center justify-center overflow-hidden rounded-xl border border-outline-200 bg-background-0 p-0"
            onPress={() => uploadRef.current?.upload()}
          >
            <Icon as={PlusCircleIcon} size="2xl" />
          </AnimatedPressable>
        )
      }
      renderItem={({ item, index }) => {
        return (
          <AnimatedCard
            layout={LinearTransition}
            entering={FadeIn}
            exiting={FadeOut}
            isDisabled={isDisabled}
            variant="filled"
            size="lg"
            className="relative h-40 w-32 p-0"
          >
            <SingleImageViewer image={extractImageData(item)} />
            <Button
              size="xs"
              action="negative"
              className="absolute right-0 top-0 rounded-none"
              style={{ borderBottomLeftRadius: 8, opacity: 0.9 }}
              disablePressAnimation
              onPress={() => uploadRef.current?.remove(index)}
            >
              <ButtonIcon as={MinusIcon} />
            </Button>
          </AnimatedCard>
        );
      }}
    />
  );
}
