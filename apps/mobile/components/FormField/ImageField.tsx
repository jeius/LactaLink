import { AnimatedPressable } from '@/components/animated/pressable';
import { ImageUpload, ImageUploadProps, ImageUploadRef } from '@/components/ImageUpload';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { ImageSchema } from '@lactalink/form-schemas';
import { PlusCircleIcon, Trash2Icon } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { FieldPath, FieldValues, useFieldArray, useFormState } from 'react-hook-form';
import { ViewProps } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SingleImageViewer } from '../ImageViewer';
import { Skeleton } from '../ui/skeleton';

const DEFAULT_LIMIT = 5;

const containerStyle = tva({
  base: 'h-40',
});

export type ImageUploadFieldType = Omit<
  ImageUploadProps,
  'value' | 'onChange' | 'containerClassName'
> & {
  className?: ViewProps['className'];
  showCount?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
};

export interface ImageUploadFieldProps extends ImageUploadFieldType {
  name: FieldPath<FieldValues>;
  value?: ImageSchema | ImageSchema[] | null;
  onChange?: (val?: ImageSchema | ImageSchema[] | null) => void;
}

export function ImageUploadField({
  selectionLimit = DEFAULT_LIMIT,
  name,
  value,
  onChange,
  className: containerClassName,
  render,
  allowsMultipleSelection: allowMultiple = false,
  isDisabled,
  ...props
}: ImageUploadFieldProps) {
  const uploadRef = useRef<ImageUploadRef>(null);

  const { isSubmitSuccessful } = useFormState({ name });

  useEffect(() => {
    if (isSubmitSuccessful) {
      uploadRef.current?.remove();
    }
  }, [isSubmitSuccessful]);

  function handleSingleChange(val: ImageSchema[]) {
    if (val.length > 0) {
      onChange?.(val[0]!);
    } else {
      onChange?.(undefined);
    }
  }

  function handleSingleRemove() {
    onChange?.(null);
    uploadRef.current?.remove();
  }

  if (allowMultiple || Array.isArray(value)) {
    return (
      <ImageArray
        {...props}
        allowsMultipleSelection={allowMultiple}
        name={name}
        selectionLimit={selectionLimit}
        value={value}
        render={render}
      />
    );
  }

  return (
    <ImageUpload
      {...props}
      ref={uploadRef}
      allowsMultipleSelection={false}
      value={value && [value]}
      containerClassName={containerStyle({ class: containerClassName })}
      onChange={handleSingleChange}
      render={(data) =>
        render?.(data) || props.isLoading ? (
          <Skeleton speed={4} variant="rounded" className="h-24 w-20" />
        ) : (
          data[0] && (
            <ImageCard onRemove={handleSingleRemove} data={data[0]} isDisabled={isDisabled} />
          )
        )
      }
    />
  );
}

function ImageArray({
  selectionLimit: limit = DEFAULT_LIMIT,
  name,
  value: values,
  className: containerClassName,
  render,
  allowsMultipleSelection: allowMultiple = true,
  isLoading,
  isDisabled,
  ...props
}: ImageUploadFieldProps) {
  const uploadRef = useRef<ImageUploadRef>(null);

  const { append, remove, ...fieldArray } = useFieldArray({ name, keyName: 'fieldID' });

  const fields = fieldArray.fields as (ImageSchema & { fieldID: string })[];
  const limitReached = fields.length >= limit;
  const isEmpty = !fields || fields.length === 0;

  function handleOnChange(val: ImageSchema[]) {
    for (const v of val) {
      append(v);
    }
  }

  function handleRemove(index: number) {
    remove(index);
    uploadRef.current?.remove(index);
  }

  return (
    <ImageUpload
      {...props}
      ref={uploadRef}
      allowsMultipleSelection={allowMultiple}
      selectionLimit={allowMultiple ? limit - (fields?.length || 0) : 1}
      value={Array.isArray(values) ? values : values && [values]}
      containerClassName={containerStyle({ class: containerClassName })}
      onChange={handleOnChange}
      render={(values) =>
        render?.(values) || allowMultiple ? (
          <HStack space="sm" className="flex-wrap">
            {fields.map(({ fieldID, ...field }, i) => {
              return isLoading ? (
                <Skeleton key={fieldID} speed={4} variant="rounded" className="h-24 w-20" />
              ) : (
                <ImageCard
                  key={fieldID}
                  onRemove={() => handleRemove(i)}
                  data={field}
                  isDisabled={isDisabled}
                />
              );
            })}
            {!isEmpty && !limitReached && !isLoading && (
              <AnimatedPressable disabled={isDisabled} onPress={() => uploadRef.current?.upload()}>
                <Card
                  isDisabled={isDisabled}
                  variant="filled"
                  size="lg"
                  className="h-24 w-20 items-center justify-center"
                >
                  <Icon as={PlusCircleIcon} size="xl" className="text-success-500" />
                </Card>
              </AnimatedPressable>
            )}
          </HStack>
        ) : (
          !isEmpty && (
            <ImageCard
              key={fields[0]!.fieldID}
              data={fields[0]!}
              isDisabled={isDisabled}
              onRemove={() => handleRemove(0)}
            />
          )
        )
      }
    />
  );
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface ImageCardProps {
  data: Pick<ImageSchema, 'url' | 'alt' | 'blurhash'>;
  isDisabled?: boolean;
  onRemove?: () => void;
}

function ImageCard({ isDisabled, data, onRemove }: ImageCardProps) {
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
      <SingleImageViewer image={{ uri: data.url, alt: data.alt, blurHash: data.blurhash }} />
      <Button
        size="xs"
        action="negative"
        className="absolute right-0 top-0 rounded-md opacity-90"
        disablePressAnimation
        onPress={onRemove}
      >
        <ButtonIcon as={Trash2Icon} />
      </Button>
    </AnimatedCard>
  );
}
