import { Admin } from '@lactalink/types';
import { Payload } from 'payload';
import SeedPSGC from '../SeedPSGC';
import './style.scss';

interface Props {
  user: Admin;
  payload: Payload;
}

export default function BeforeDashboard({ user }: Props) {
  return (
    <div className="dashboard_container px-5 py-4">
      <div>
        <h1 className="mb-2 text-4xl">Welcome {user.name}!</h1>
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
