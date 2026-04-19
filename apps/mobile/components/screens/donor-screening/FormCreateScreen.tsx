import SafeArea from '@/components/SafeArea';
import ScreeningForm from '@/features/donor-screening/components/ScreeningForm';

export default function FormCreateScreen() {
  return (
    <SafeArea safeTop={false} className="items-stretch justify-start">
      <ScreeningForm />
    </SafeArea>
  );
}
