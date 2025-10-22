import { cn } from '@/lib/utils';

describe('Utils Library', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('px-2', 'py-1');
      expect(result).toBe('px-2 py-1');
    });

    it('handles conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('merges Tailwind classes correctly', () => {
      // twMerge should merge conflicting Tailwind classes
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4');
    });

    it('handles empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'other');
      expect(result).toBe('base other');
    });

    it('handles arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('handles objects with conditional classes', () => {
      const result = cn({
        'always-present': true,
        'conditionally-present': true,
        'never-present': false,
      });
      expect(result).toContain('always-present');
      expect(result).toContain('conditionally-present');
      expect(result).not.toContain('never-present');
    });
  });
});
