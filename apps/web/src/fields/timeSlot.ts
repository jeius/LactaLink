import { TIME_SLOT_TYPES, TIME_SLOTS } from '@/lib/constants';
import { Condition, Field } from 'payload';

interface TimeSlotFieldOptions {
  defaultType?: 'PRESET' | 'CUSTOM';
  condition?: Condition;
  label?: string;
  required?: boolean;
  description?: string;
}

export const timeSlotField = ({
  condition,
  defaultType = 'PRESET',
  label = 'Time Slot',
  required = false,
  description,
}: TimeSlotFieldOptions = {}): Field => {
  return {
    name: 'timeSlot',
    label,
    type: 'group',
    interfaceName: 'TimeSlot',
    required,
    admin: { condition, description },
    fields: [
      {
        name: 'type',
        label: 'Time Slot Type',
        type: 'select',
        enumName: 'enum_time_slot_type',
        required: true,
        defaultValue: defaultType,
        options: Object.values(TIME_SLOT_TYPES),
      },
      {
        name: 'presetSlot',
        label: 'Preset Time Slot',
        type: 'select',
        enumName: 'enum_time_slot_preset',
        options: Object.values(TIME_SLOTS),
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'PRESET',
        },
      },
      {
        name: 'customTime',
        label: 'Custom Time Range',
        type: 'group',
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'CUSTOM',
        },
        fields: [
          {
            name: 'startTime',
            label: 'Start Time',
            type: 'date',
            required: true,
            admin: {
              placeholder: 'e.g., 09:30',
            },
          },
          {
            name: 'endTime',
            label: 'End Time',
            type: 'date',
            required: true,
            admin: {
              placeholder: 'e.g., 11:30',
            },
          },
        ],
      },
    ],
  };
};
