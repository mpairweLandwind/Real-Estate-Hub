import { propertySchema, maintenanceSchema, profileSchema } from '@/lib/validations';

describe('Validation Schemas', () => {
  describe('propertySchema', () => {
    const validPropertyData = {
      title: 'Beautiful Apartment',
      description: 'A nice place to live',
      propertyType: 'apartment' as const,
      listingType: 'rent' as const,
      price: 1500,
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1200,
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      latitude: 40.7128,
      longitude: -74.0060,
    };

    it('validates correct property data', () => {
      const result = propertySchema.safeParse(validPropertyData);
      expect(result.success).toBe(true);
    });

    it('rejects short title', () => {
      const result = propertySchema.safeParse({
        ...validPropertyData,
        title: 'Apt',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid property type', () => {
      const result = propertySchema.safeParse({
        ...validPropertyData,
        propertyType: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid price', () => {
      const result = propertySchema.safeParse({
        ...validPropertyData,
        price: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid latitude', () => {
      const result = propertySchema.safeParse({
        ...validPropertyData,
        latitude: 91,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid longitude', () => {
      const result = propertySchema.safeParse({
        ...validPropertyData,
        longitude: 181,
      });
      expect(result.success).toBe(false);
    });

    it('accepts optional fields as null', () => {
      const result = propertySchema.safeParse({
        ...validPropertyData,
        bedrooms: null,
        bathrooms: null,
        areaSqft: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('maintenanceSchema', () => {
    const validMaintenanceData = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Fix leaking faucet',
      description: 'The kitchen faucet is leaking and needs repair',
      category: 'plumbing' as const,
      priority: 'high' as const,
      estimatedCost: 150,
    };

    it('validates correct maintenance data', () => {
      const result = maintenanceSchema.safeParse(validMaintenanceData);
      expect(result.success).toBe(true);
    });

    it('rejects short title', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenanceData,
        title: 'Fix',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short description', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenanceData,
        description: 'Too short',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID for propertyId', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenanceData,
        propertyId: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid category', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenanceData,
        category: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid priority', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenanceData,
        priority: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('accepts null estimatedCost', () => {
      const result = maintenanceSchema.safeParse({
        ...validMaintenanceData,
        estimatedCost: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('profileSchema', () => {
    const validProfileData = {
      fullName: 'John Doe',
      phone: '+1-234-567-8900',
      userType: 'tenant' as const,
    };

    it('validates correct profile data', () => {
      const result = profileSchema.safeParse(validProfileData);
      expect(result.success).toBe(true);
    });

    it('rejects short name', () => {
      const result = profileSchema.safeParse({
        ...validProfileData,
        fullName: 'A',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid phone format', () => {
      const result = profileSchema.safeParse({
        ...validProfileData,
        phone: 'not-a-phone',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid phone formats', () => {
      const validFormats = [
        '1234567890',
        '+1-234-567-8900',
        '123-456-7890',
      ];

      validFormats.forEach((phone) => {
        const result = profileSchema.safeParse({
          ...validProfileData,
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it('accepts empty phone string', () => {
      const result = profileSchema.safeParse({
        ...validProfileData,
        phone: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid user type', () => {
      const result = profileSchema.safeParse({
        ...validProfileData,
        userType: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});
