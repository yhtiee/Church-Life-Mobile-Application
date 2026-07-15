/**
 * Contact configuration for reaching the app / parish administrator.
 *
 * ⚠️ SET THIS: replace ADMIN_WHATSAPP with the admin's real WhatsApp number in
 * full international format, digits only — no "+", spaces, or dashes.
 * Example: a Nigerian number +234 803 123 4567 becomes '2348031234567'.
 */
export const ADMIN_WHATSAPP = '2348000000000'; // TODO: replace with real admin number

/** Display-friendly version of the admin number (with +). */
export const ADMIN_WHATSAPP_DISPLAY = `+${ADMIN_WHATSAPP}`;

/** Default message pre-filled when a user enquires about advertising. */
export const ADVERTISE_ENQUIRY_MESSAGE =
  "Hello! I'm interested in displaying an ad on the ChurchLife app. " +
  'Please share the details, pricing, and next steps.';

/** Default country calling code used when a number is entered in local format. */
export const DEFAULT_COUNTRY_CODE = '234'; // Nigeria

/**
 * Normalise a user-entered phone number to the digits-only international format
 * WhatsApp expects. Handles common inputs:
 *   "+234 803 123 4567" → "2348031234567"
 *   "0803 123 4567"     → "2348031234567"  (local 0-prefixed → country code)
 *   "2348031234567"     → "2348031234567"
 * Returns null if there aren't enough digits to be a real number.
 */
export function normalizePhoneForWhatsApp(
  raw: string | null | undefined,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string | null {
  if (!raw) return null;
  const hadPlus = raw.trim().startsWith('+');
  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;

  if (!hadPlus && digits.startsWith('0')) {
    // Local trunk-prefixed number → swap the leading 0 for the country code.
    digits = countryCode + digits.slice(1);
  }
  return digits.length >= 10 ? digits : null;
}

/**
 * Build a WhatsApp deep link. `wa.me` opens the WhatsApp app when installed and
 * falls back to WhatsApp Web in a browser otherwise. The phone is normalised so
 * numbers stored in local format still work.
 */
export function buildWhatsAppUrl(message: string, phone: string = ADMIN_WHATSAPP): string {
  const normalized = normalizePhoneForWhatsApp(phone) ?? phone;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
