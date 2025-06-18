import { AnimatedPressable } from '@/components/animated/pressable';
import { DraggableWrapper, DraggableWrapperRef } from '@/components/DraggableWrapper';
import { Image } from '@/components/Image';
import { ImageUpload, ImageUploadProps, ImageUploadRef } from '@/components/ImageUpload';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { ImageSchema } from '@lactalink/types';
import { Motion } from '@legendapp/motion';
import { PlusCircleIcon, Trash2Icon } from 'lucide-react-native';
import React, { createRef, useEffect, useRef } from 'react';
import { FieldPath, FieldValues, useFieldArray, useFormState } from 'react-hook-form';
import { ViewProps } from 'react-native';

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
  allowsMultipleSelection: allowMultiple = true,
  ...props
}: ImageUploadFieldProps) {
  const draggableRefs = useRef<DraggableWrapperRef>(null);
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
        render?.(data) || (
          <DraggableWrapper
            disabled
            key={value?.filename}
            ref={draggableRefs}
            onDismiss={handleSingleRemove}
            dismissAnimationType="fade"
          >
            <Motion.View initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card size="lg" className="relative h-24 w-20 p-0">
                {data.length > 0 && data[0]?.url && (
                  <Image
                    alt={data[0].alt || 'Image'}
                    source={{ uri: data[0].url }}
                    contentFit="cover"
                    contentPosition={'center'}
                    style={{ width: '100%', height: '100%' }}
                    recyclingKey={`image-upload-${data[0].filename}`}
                  />
                )}
                <Box className="absolute right-0 top-0">
                  <Button
                    size="xs"
                    action="negative"
                    className="rounded-md opacity-90"
                    animateOnPress={false}
                    onPress={() => {
                      draggableRefs.current?.dismiss();
                    }}
                  >
                    <ButtonIcon as={Trash2Icon} />
                  </Button>
                </Box>
              </Card>
            </Motion.View>
          </DraggableWrapper>
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
  ...props
}: ImageUploadFieldProps) {
  const draggableRefs = useRef<DraggableWrapperRef[]>([]);
  const uploadRef = useRef<ImageUploadRef>(null);

  const { append, remove, fields } = useFieldArray({ name });

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

  useEffect(() => {
    if (fields) {
      draggableRefs.current = fields.map(
        (_, i) => draggableRefs.current[i] ?? createRef<DraggableWrapperRef>().current!
      );
    }
  }, [fields]);

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
            {fields.map((field, i) => {
              return (
                <DraggableWrapper
                  disabled
                  key={field.id}
                  ref={(ref) => {
                    draggableRefs.current[i] = ref!;
                  }}
                  onDismiss={() => handleRemove(i)}
                  dismissAnimationType="fade"
                >
                  <Motion.View initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card size="lg" className="relative h-24 w-20 p-0">
                      {values[i]?.url && (
                        <Image
                          alt={values[i].alt || 'Image'}
                          source={{ uri: values[i].url }}
                          contentFit="cover"
                          contentPosition={'center'}
                          style={{ width: '100%', height: '100%' }}
                          recyclingKey={`image-upload-${field.id}`}
                        />
                      )}
                      <Box className="absolute right-0 top-0">
                        <Button
                          size="xs"
                          action="negative"
                          className="rounded-md opacity-90"
                          animateOnPress={false}
                          onPress={() => {
                            draggableRefs.current[i]?.dismiss();
                          }}
                        >
                          <ButtonIcon as={Trash2Icon} />
                        </Button>
                      </Box>
                    </Card>
                  </Motion.View>
                </DraggableWrapper>
              );
            })}
            {!isEmpty && !limitReached && (
              <AnimatedPressable onPress={() => uploadRef.current?.upload()}>
                <Card size="lg" className="h-24 w-20 items-center justify-center">
                  <Icon as={PlusCircleIcon} size="xl" className="text-success-500" />
                </Card>
              </AnimatedPressable>
            )}
          </HStack>
        ) : (
          !isEmpty && (
            <DraggableWrapper
              disabled
              key={fields[0]!.id}
              ref={(ref) => {
                draggableRefs.current[0] = ref!;
              }}
              onDismiss={() => handleRemove(0)}
              dismissAnimationType="fade"
            >
              <Motion.View initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card size="lg" className="relative h-24 w-20 p-0">
                  {values[0]?.url && (
                    <Image
                      alt={values[0].alt || 'Image'}
                      source={{ uri: values[0].url }}
                      contentFit="cover"
                      contentPosition={'center'}
                      style={{ width: '100%', height: '100%' }}
                      recyclingKey={`image-upload-${fields[0]!.id}`}
                    />
                  )}
                  <Box className="absolute right-0 top-0">
                    <Button
                      size="xs"
                      action="negative"
                      className="rounded-md opacity-90"
                      animateOnPress={false}
                      onPress={() => {
                        draggableRefs.current[0]?.dismiss();
                      }}
                    >
                      <ButtonIcon as={Trash2Icon} />
                    </Button>
                  </Box>
                </Card>
              </Motion.View>
            </DraggableWrapper>
          )
        )
      }
    />
  );
}
