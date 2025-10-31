export class User {
  constructor(
    public id: number,
    public nombre: string,
    public email: string,
    public password_hash: string,
    public rol: string,
    public fecha_registro: Date
  ) {}

  // Métodos de dominio
  public isAdmin(): boolean {
    return this.rol === 'admin';
  }

  public canManageUsers(): boolean {
    return this.isAdmin();
  }
}