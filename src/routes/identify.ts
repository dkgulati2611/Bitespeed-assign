import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Contact } from '../entity/Contact';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'At least one of email or phoneNumber is required.' });
  }

  const contactRepo = AppDataSource.getRepository(Contact);

  // Find all contacts matching email or phoneNumber
  const contacts = await contactRepo.find({
    where: [
      ...(email ? [{ email }] : []),
      ...(phoneNumber ? [{ phoneNumber }] : []),
    ],
    order: { createdAt: 'ASC' },
  });

  let primaryContact: Contact | null = null;
  let allContacts: Contact[] = [];

  if (contacts.length === 0) {
    // No match, create new primary
    const newContact = contactRepo.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkPrecedence: 'primary',
      linkedId: null,
    });
    await contactRepo.save(newContact);
    primaryContact = newContact;
    allContacts = [newContact];
  } else {
    // There are matches, find all related contacts (primary + secondaries)
    // Find all unique primary contacts
    const primaryContacts = contacts.filter((c: Contact) => c.linkPrecedence === 'primary');
    let oldestPrimary: Contact;
    if (primaryContacts.length > 1) {
      // More than one primary, merge needed
      // Find the oldest primary
      oldestPrimary = primaryContacts.reduce((oldest, curr) =>
        curr.createdAt < oldest.createdAt ? curr : oldest
      );
      // The other primaries (to be demoted)
      const toDemote = primaryContacts.filter((c) => c.id !== oldestPrimary.id);
      for (const demote of toDemote) {
        // Demote the primary
        demote.linkPrecedence = 'secondary';
        demote.linkedId = oldestPrimary.id;
        await contactRepo.save(demote);
        // Demote all its secondaries
        const secondaries = await contactRepo.find({ where: { linkedId: demote.id } });
        for (const sec of secondaries) {
          sec.linkedId = oldestPrimary.id;
          await contactRepo.save(sec);
        }
      }
      primaryContact = oldestPrimary;
    } else {
      primaryContact = primaryContacts[0] || contacts[0];
    }
    // Get all contacts linked to this primary
    if (primaryContact) {
      allContacts = await contactRepo.find({
        where: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id },
        ],
        order: { createdAt: 'ASC' },
      });
    }
    // If the current email/phone is not present, add as secondary
    const emailExists = allContacts.some((c: Contact) => c.email === email);
    const phoneExists = allContacts.some((c: Contact) => c.phoneNumber === phoneNumber);
    if ((email && !emailExists) || (phoneNumber && !phoneExists)) {
      if (primaryContact) {
        const newSecondary = contactRepo.create({
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id,
        });
        await contactRepo.save(newSecondary);
        allContacts.push(newSecondary);
      }
    }
  }

  if (!primaryContact) {
    return res.status(500).json({ error: 'Primary contact could not be determined.' });
  }

  // Prepare response
  const emails = Array.from(new Set(allContacts.map((c: Contact) => c.email).filter(Boolean)));
  const phoneNumbers = Array.from(new Set(allContacts.map((c: Contact) => c.phoneNumber).filter(Boolean)));
  const secondaryContactIds = allContacts
    .filter((c: Contact) => c.linkPrecedence === 'secondary')
    .map((c: Contact) => c.id);

  res.json({
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  });
});

export default router; 