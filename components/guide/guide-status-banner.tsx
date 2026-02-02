import Link from 'next/link';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { GuideStatus } from '@/types/database';

interface GuideStatusBannerProps {
  status: GuideStatus;
}

export function GuideStatusBanner({ status }: GuideStatusBannerProps) {
  // Don't show banner for approved guides
  if (status === 'approved') {
    return null;
  }

  const config = {
    draft: {
      icon: AlertTriangle,
      title: 'Complete Your Onboarding',
      description:
        'Your public profile is currently hidden. Complete the onboarding steps to submit for review and go live.',
      variant: 'warning' as const,
      action: {
        label: 'Continue Onboarding',
        href: '/guide/onboarding',
      },
    },
    pending: {
      icon: Clock,
      title: 'Profile Under Review',
      description:
        'Your profile has been submitted and is being reviewed by our team. You'll receive an email once approved.',
      variant: 'info' as const,
      action: null,
    },
    rejected: {
      icon: XCircle,
      title: 'Profile Not Approved',
      description:
        'Unfortunately, your profile was not approved. Please update your information and resubmit for review.',
      variant: 'destructive' as const,
      action: {
        label: 'Update Profile',
        href: '/guide/onboarding',
      },
    },
  };

  const { icon: Icon, title, description, variant, action } = config[status];

  const variantStyles = {
    warning: 'border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600',
    info: 'border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600',
    destructive: 'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
  };

  return (
    <Alert className={variantStyles[variant]}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
        <span>{description}</span>
        {action && (
          <Button
            asChild
            size="sm"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className={
              variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : undefined
            }
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
