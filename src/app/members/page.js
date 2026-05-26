import React from 'react';
import MembersClient from './MembersClient';

export const metadata = {
  title: 'Verified Member Directory | Cockroach India Store',
  description: 'Displaying all verified comrades and citizens who have joined the Cockroach India Store movement and bypassed toxic productivity.',
  alternates: {
    canonical: '/members',
  },
};

export default function MembersPage() {
  return <MembersClient />;
}
