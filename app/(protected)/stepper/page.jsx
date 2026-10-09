import React from 'react';
import StepperController from '@/features/stepper/StepperController';

// Optional: Next.js Server-side Metadata for SEO / Browser Tabs
export const metadata = {
  title: 'Workspace Setup | SaafAI',
  description: 'Configure your facility hierarchy, washrooms, and staff deployments.',
};

export default function StepperPage() {
  return (
    // The controller handles all the layout, state, and routing between discovery & setup phases.
    <StepperController />
  );
}