import { getDatabase } from '../storage/database';
import { Contact } from '../models';

export class ContactRepository {
  private static instance: ContactRepository;

  private constructor() {}

  public static getInstance(): ContactRepository {
    if (!ContactRepository.instance) {
      ContactRepository.instance = new ContactRepository();
    }
    return ContactRepository.instance;
  }

  public async getAllContacts(): Promise<Contact[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>('SELECT * FROM contacts ORDER BY name ASC');

    if (rows.length === 0) {
      return [];
    }

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      relationship: r.relationship,
      phoneNumber: r.phone_number,
      isEmergencyContact: Boolean(r.is_emergency_contact),
      photoUri: r.photo_uri,
      createdAt: r.created_at || new Date().toISOString(),
    }));
  }

  public async findByNameOrRelation(query: string): Promise<Contact[]> {
    const all = await this.getAllContacts();
    const cleanQuery = query.toLowerCase().trim();

    return all.filter(c => {
      const matchName = c.name.toLowerCase().includes(cleanQuery);
      const matchRelation = c.relationship ? c.relationship.toLowerCase().includes(cleanQuery) : false;
      return matchName || matchRelation;
    });
  }

  public async getPrimaryEmergencyContact(): Promise<Contact | null> {
    const all = await this.getAllContacts();
    const emergency = all.find(c => c.isEmergencyContact && c.phoneNumber && c.phoneNumber.trim().length >= 7);
    return emergency || null;
  }

  public async addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    const db = await getDatabase();
    const id = `contact-${Date.now()}`;
    const createdAt = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO contacts (id, name, relationship, phone_number, is_emergency_contact)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        contact.name,
        contact.relationship || '',
        contact.phoneNumber,
        contact.isEmergencyContact ? 1 : 0,
      ]
    );

    return {
      ...contact,
      id,
      createdAt,
    };
  }

  public async deleteContact(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM contacts WHERE id = ?', [id]);
  }

  public async seedInitialContacts(): Promise<void> {
    // No insertar contactos ficticios por defecto. El adulto mayor o cuidador
    // configura su contacto real desde la agenda de su celular o manualmente.
  }
}

export const contactRepository = ContactRepository.getInstance();
