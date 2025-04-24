import { User } from '@lactalink/types';
import { Payload } from 'payload';
import SeedPSGC from '../SeedPSGC';

interface Props {
  user: User;
  payload: Payload;
}

export default function BeforeDashboard(_: Props) {
  return (
    <div className="bg-card rounded-2xl px-5 py-4">
      <div>
        <h1 className="mb-2 text-4xl">Welcome!</h1>
        <p className="text-lg">
          Manage users, monitor milk donations, and keep the platform running smoothly. Everything
          you need to oversee and support the breastmilk sharing community is right here.
        </p>
      </div>
      <div>
        <SeedPSGC />
      </div>
    </div>
  );
}
