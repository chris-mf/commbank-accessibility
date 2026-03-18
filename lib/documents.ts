export interface ChecklistItem {
  text: string;
  required: boolean;
  note?: string;
}

export function getDocumentChecklist(
  customerType?: string,
  accountType?: string
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (customerType === 'new') {
    items.push({
      text: 'Primary photo ID',
      required: true,
      note: 'Australian or NZ Driver Licence (physical copy only — digital not accepted), or Australian or foreign passport',
    });
    items.push({
      text: 'If no photo ID: two non-photo documents',
      required: false,
      note: 'e.g. Birth certificate + Centrelink card',
    });
    items.push({
      text: 'Tax File Number (TFN)',
      required: false,
      note: 'Not mandatory but recommended',
    });
    items.push({
      text: 'If your name has changed: Marriage Certificate or Change of Name document',
      required: false,
    });
    items.push({
      text: 'Medicare card or Centrelink card (as secondary ID)',
      required: false,
    });
  } else {
    // Existing customer
    items.push({
      text: 'Your debit card or account details',
      required: true,
    });
    items.push({
      text: 'Photo ID (if updating details)',
      required: false,
      note: 'Driver licence or passport',
    });
  }

  return items;
}

export function getWhatToExpect(
  customerType?: string,
  startedOnline?: string
): string[] {
  const points: string[] = [];

  if (customerType === 'new') {
    if (startedOnline === 'yes') {
      points.push('You\'ve already started your application online — the branch staff will complete your ID verification.');
      points.push('Bring your photo ID so they can verify your identity in person.');
    } else {
      points.push('A staff member will help you choose the right account and complete the application.');
      points.push('They\'ll need to verify your identity, so bring your photo ID.');
    }
    points.push('The whole process usually takes about 20–30 minutes.');
  } else {
    points.push('Let the staff know what you need help with when you arrive.');
    points.push('Most enquiries take 10–15 minutes.');
  }

  points.push('All branches have access to the Equal Access Toolkit — staff can provide support tools on request.');
  points.push('If English is not your first language, staff can arrange a Translating and Interpreting Service (TIS National).');

  return points;
}
