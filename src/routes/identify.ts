import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Contact } from '../entity/Contact';

const router = Router();

router.post('/', async (req, res) => {
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
    // Find the oldest primary
    primaryContact = contacts.find(c => c.linkPrecedence === 'primary') || contacts[0];
    // Get all contacts linked to this primary
    allContacts = await contactRepo.find({
      where: [
        { id: primaryContact.id },
        { linkedId: primaryContact.id },
      ],
      order: { createdAt: 'ASC' },
    });

    // If the current email/phone is not present, add as secondary
    const emailExists = allContacts.some(c => c.email === email);
    const phoneExists = allContacts.some(c => c.phoneNumber === phoneNumber);
    if ((email && !emailExists) || (phoneNumber && !phoneExists)) {
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

  // Prepare response
  const emails = Array.from(new Set(allContacts.map(c => c.email).filter(Boolean)));
  const phoneNumbers = Array.from(new Set(allContacts.map(c => c.phoneNumber).filter(Boolean)));
  const secondaryContactIds = allContacts
    .filter(c => c.linkPrecedence === 'secondary')
    .map(c => c.id);

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