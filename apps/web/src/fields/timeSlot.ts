import { Condition, Field } from 'payload';

interface TimeSlotFieldOptions {
  defaultType?: 'PRESET' | 'CUSTOM';
  condition?: Condition;
}

export const timeSlotField = ({
  condition,
  defaultType = 'PRESET',
}: TimeSlotFieldOptions = {}): Field => {
  return {
    name: 'timeSlot',
    label: 'Time Slot',
    type: 'group',
    interfaceName: 'TimeSlot',
    admin: { condition },
    fields: [
      {
        name: 'type',
        label: 'Time Slot Type',
        type: 'select',
        enumName: 'enum_time_slot_type',
        required: true,
        defaultValue: defaultType,
        options: [
          { label: 'Choose from preset slots', value: 'PRESET' },
          { label: 'Set custom time', value: 'CUSTOM' },
        ],
      },
      {
        name: 'presetSlot',
        label: 'Preset Time Slot',
        type: 'select',
        enumName: 'enum_time_slot_preset',
        options: [
          { label: '8:00 AM - 10:00 AM', value: '08:00-10:00' },
          { label: '10:00 AM - 12:00 PM', value: '10:00-12:00' },
          { label: '12:00 PM - 2:00 PM', value: '12:00-14:00' },
          { label: '2:00 PM - 4:00 PM', value: '14:00-16:00' },
          { label: '4:00 PM - 6:00 PM', value: '16:00-18:00' },
          { label: '6:00 PM - 8:00 PM', value: '18:00-20:00' },
        ],
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
