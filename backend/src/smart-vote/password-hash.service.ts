import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHashService {
  // Hash password before saving to database
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // You can adjust the salt rounds here
    return bcrypt.hash(password, saltRounds);
  }

  // Compare plain password with stored hashed password
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    // Ensure both arguments are not empty
    if (!plainPassword || !hashedPassword) {
      throw new Error('Both plainPassword and hashedPassword are required');
    }

    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Test password comparison
  async testPassword() {
    const plainPassword = 'test123';
    const storedHash =
      '$2b$10$cWRWTDaTUBm2.VLiu0FVn.jNrEpXsVRyj4yyS0hTkb7Lbi3f0lSy.';

    // Compare plain password with the stored hash
    const isPasswordValid = await bcrypt.compare(plainPassword, storedHash);

    console.log('Is password valid?', isPasswordValid);
  }
}

// // To test the password comparison manually:
// (async () => {
//   const passwordService = new PasswordHashService();
//   await passwordService.testPassword();
// })();
