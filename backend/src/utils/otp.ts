// utils/otp.ts
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

// In-memory store for OTP (for demo purposes)
const otpStore = new Map();

export function storeOTP(email: string, otp: string) {
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // OTP expires in 10 minutes
}

export function verifyOTP(email: string, otp: string): boolean {
  const stored = otpStore.get(email);
  if (!stored || Date.now() > stored.expiresAt) {
    return false; // OTP expired or not found
  }
  return stored.otp === otp;
}
