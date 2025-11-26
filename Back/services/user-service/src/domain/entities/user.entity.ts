// /domain/entities/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('User name is required');
    }
    if (name.length > 100) {
      throw new Error('User name too long');
    }
    if (!email || email.trim().length === 0) {
      throw new Error('User email is required');
    }
    if (!password || password.trim().length === 0) {
      throw new Error('User password is required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }
}