import { Branch } from './types';

export const BRANCHES: Branch[] = [
  {
    id: 'martin-place',
    name: 'CommBank Martin Place',
    address: '48 Martin Place',
    suburb: 'Sydney',
    postcode: '2000',
    distanceKm: 0.5,
    driveMinutes: 5,
    walkMinutes: 8,
    features: {
      quietRoom: true,
      hearingLoop: true,
      wheelchairAccess: true,
      accessibleParking: false,
      privateMeetingRoom: true,
      automaticDoors: true,
    },
    hours: 'Mon–Fri 9:30am–4pm',
    phone: '(02) 9000 1001',
  },
  {
    id: 'chatswood',
    name: 'CommBank Chatswood',
    address: '345 Victoria Avenue',
    suburb: 'Chatswood',
    postcode: '2067',
    distanceKm: 8.2,
    driveMinutes: 18,
    walkMinutes: 95,
    features: {
      quietRoom: true,
      hearingLoop: true,
      wheelchairAccess: true,
      accessibleParking: true,
      privateMeetingRoom: true,
      automaticDoors: true,
    },
    hours: 'Mon–Fri 9:30am–4pm, Sat 9am–12pm',
    phone: '(02) 9000 1002',
  },
  {
    id: 'parramatta',
    name: 'CommBank Parramatta',
    address: '160 Church Street',
    suburb: 'Parramatta',
    postcode: '2150',
    distanceKm: 23.1,
    driveMinutes: 32,
    walkMinutes: 240,
    features: {
      quietRoom: true,
      hearingLoop: false,
      wheelchairAccess: true,
      accessibleParking: true,
      privateMeetingRoom: true,
      automaticDoors: true,
    },
    hours: 'Mon–Fri 9:30am–4pm',
    phone: '(02) 9000 1003',
  },
  {
    id: 'bondi-junction',
    name: 'CommBank Bondi Junction',
    address: '500 Oxford Street',
    suburb: 'Bondi Junction',
    postcode: '2022',
    distanceKm: 5.8,
    driveMinutes: 15,
    walkMinutes: 65,
    features: {
      quietRoom: false,
      hearingLoop: true,
      wheelchairAccess: true,
      accessibleParking: true,
      privateMeetingRoom: false,
      automaticDoors: true,
    },
    hours: 'Mon–Fri 9:30am–4pm',
    phone: '(02) 9000 1004',
  },
  {
    id: 'hurstville',
    name: 'CommBank Hurstville',
    address: '225 Forest Road',
    suburb: 'Hurstville',
    postcode: '2220',
    distanceKm: 15.3,
    driveMinutes: 25,
    walkMinutes: 180,
    features: {
      quietRoom: false,
      hearingLoop: true,
      wheelchairAccess: true,
      accessibleParking: true,
      privateMeetingRoom: true,
      automaticDoors: false,
    },
    hours: 'Mon–Fri 9:30am–4pm',
    phone: '(02) 9000 1005',
  },
  {
    id: 'burwood',
    name: 'CommBank Burwood',
    address: '171 Burwood Road',
    suburb: 'Burwood',
    postcode: '2134',
    distanceKm: 11.0,
    driveMinutes: 20,
    walkMinutes: 120,
    features: {
      quietRoom: true,
      hearingLoop: false,
      wheelchairAccess: true,
      accessibleParking: true,
      privateMeetingRoom: true,
      automaticDoors: true,
    },
    hours: 'Mon–Fri 9:30am–4pm, Sat 9am–12pm',
    phone: '(02) 9000 1006',
  },
  {
    id: 'hornsby',
    name: 'CommBank Hornsby',
    address: '32 Florence Street',
    suburb: 'Hornsby',
    postcode: '2077',
    distanceKm: 20.5,
    driveMinutes: 28,
    walkMinutes: 220,
    features: {
      quietRoom: false,
      hearingLoop: false,
      wheelchairAccess: true,
      accessibleParking: true,
      privateMeetingRoom: true,
      automaticDoors: true,
    },
    hours: 'Mon–Fri 9:30am–4pm',
    phone: '(02) 9000 1007',
  },
  {
    id: 'newtown',
    name: 'CommBank Newtown',
    address: '280 King Street',
    suburb: 'Newtown',
    postcode: '2042',
    distanceKm: 4.2,
    driveMinutes: 12,
    walkMinutes: 48,
    features: {
      quietRoom: false,
      hearingLoop: false,
      wheelchairAccess: true,
      accessibleParking: false,
      privateMeetingRoom: false,
      automaticDoors: true,
    },
    hours: 'Mon–Fri 9:30am–4pm',
    phone: '(02) 9000 1008',
  },
];

export function filterAndRankBranches(
  accessibilityNeeds: string[],
  needsAccessibleParking?: string,
  preferCloser?: string
): Branch[] {
  const needsQuietRoom = accessibilityNeeds.includes('quiet-space');
  const needsHearingLoop = accessibilityNeeds.includes('hearing');
  const needsWheelchair = accessibilityNeeds.includes('wheelchair');
  const wantsParking = needsAccessibleParking === 'yes';

  let branches = [...BRANCHES];

  // Score each branch by how many needs it matches
  const scored = branches.map((branch) => {
    let score = 0;
    let matchedFeatures = 0;
    let totalNeeded = 0;

    if (needsQuietRoom) {
      totalNeeded++;
      if (branch.features.quietRoom) { score += 10; matchedFeatures++; }
    }
    if (needsHearingLoop) {
      totalNeeded++;
      if (branch.features.hearingLoop) { score += 10; matchedFeatures++; }
    }
    if (needsWheelchair) {
      totalNeeded++;
      if (branch.features.wheelchairAccess) { score += 10; matchedFeatures++; }
    }
    if (wantsParking) {
      totalNeeded++;
      if (branch.features.accessibleParking) { score += 10; matchedFeatures++; }
    }

    // Bonus for private meeting room (useful for many accessibility needs)
    if (branch.features.privateMeetingRoom) score += 3;
    if (branch.features.automaticDoors) score += 1;

    // Distance penalty (prefer closer branches)
    if (preferCloser === 'close') {
      score -= branch.distanceKm * 0.5;
    } else {
      score -= branch.distanceKm * 0.1;
    }

    return { branch, score, matchedFeatures, totalNeeded };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.branch);
}

export function getFeatureLabel(key: keyof Branch['features']): string {
  const labels: Record<keyof Branch['features'], string> = {
    quietRoom: 'Quiet room',
    hearingLoop: 'Hearing loop',
    wheelchairAccess: 'Wheelchair accessible',
    accessibleParking: 'Accessible parking',
    privateMeetingRoom: 'Private meeting room',
    automaticDoors: 'Automatic doors',
  };
  return labels[key];
}
