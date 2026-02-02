import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost">
        <Link
          href="/auth/sign-in"
          className="text-sm font-medium text-slate-700 hover:text-brand"
        >
          Sign in
        </Link>
      </Button>
      <Button
        asChild
        className="bg-brand hover:bg-brand-dark text-white rounded-full px-5"
      >
        <Link href="/auth/sign-up?role=traveler">Sign up</Link>
      </Button>
    </div>
  );
}
