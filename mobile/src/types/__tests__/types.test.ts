import type { Event, Member, Donation } from '../index';

describe('types module', () => {
  it('exports Event shape that a sample object satisfies', () => {
    const event: Event = {
      id: 1,
      title: 'Sunday Service',
      description: 'Weekly worship',
      eventDate: '2026-07-26',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Main Sanctuary',
      recurring: true,
    };

    expect(event.title).toBe('Sunday Service');
    expect(event.recurring).toBe(true);
    expect(typeof event.id).toBe('number');
  });

  it('exports Member and Donation shapes', () => {
    const member: Member = {
      id: 10,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '555-0100',
      gender: 'F',
      active: true,
    };

    const donation: Donation = {
      id: 20,
      amount: 50,
      category: 'General',
      donationDate: '2026-07-22',
    };

    expect(member.firstName).toBe('Jane');
    expect(donation.amount).toBe(50);
  });
});
