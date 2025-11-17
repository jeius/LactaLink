import { saveFormData, SchemaName } from '@/lib/localStorage/utils';
import debounce from 'lodash/debounce';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

/**
 * A component that saves form data to local storage whenever the form values change.
 * Uses debouncing to limit the frequency of saves. Access the saved data via `getSavedFormData`.
 * @param schemaName - The name of the schema to save the form data under.
 */
export default function FormSaver({ schemaName }: { schemaName: SchemaName }) {
  const values = useWatch();
  const debouncedSave = useMemo(
    () => debounce((value) => saveFormData(schemaName, value)),
    [schemaName]
  );

  useEffect(() => {
    debouncedSave(values);
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave, values]);

  return null;
}
