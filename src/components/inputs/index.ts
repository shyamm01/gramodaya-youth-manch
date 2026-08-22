'use client';

/**
 * Composite inputs the app owns.
 *
 * These are not shadcn registry components — they are bespoke widgets with
 * their own behaviour (a bilingual date picker, an uploader with cropping).
 * Keeping them out of components/ui means that folder stays exactly what
 * `shadcn add`/`shadcn diff` expects it to be, so a registry update never has
 * to reason about hand-written files sitting next to the generated ones.
 */
export * from './DatePicker';
export * from './ImageUploader';
export * from './ImageCropperModal';
