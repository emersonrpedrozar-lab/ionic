import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model';
import { EncryptProvider } from '../shared/providers/encrypt.provider';
import { StorageProvider } from '../shared/providers/storage.provider';
import { ToastProvider } from '../shared/providers/toast.provider';
import { LoaderProvider } from '../shared/providers/loader.provider';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly USERS_KEY = 'USERS_LIST';

  constructor(
    private encrypt: EncryptProvider,
    private storage: StorageProvider,
    private toast: ToastProvider,
    private loader: LoaderProvider
  ) {}

  private getAll(): User[] {
    return this.storage.get<User[]>(this.USERS_KEY) || [];
  }

  private saveAll(users: User[]): void {
    this.storage.set(this.USERS_KEY, users);
  }

  async register(user: Omit<User, 'id'|'password'> & { password: string }): Promise<User> {
    await this.loader.present('Creando usuario...');
    try {
      const users = this.getAll();
      if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        throw new Error('El correo ya está registrado');
      }

      const created: User = {
        ...user,
        id: uuidv4(),
        password: this.encrypt.hash(user.password)
      };

      users.push(created);
      this.saveAll(users);
      await this.toast.present('Usuario registrado');
      return created;
    } catch (e: any) {
      await this.toast.present(e?.message || 'No se pudo registrar');
      throw e;
    } finally {
      await this.loader.dismiss();
    }
  }

  async update(user: User): Promise<User> {
    await this.loader.present('Actualizando usuario...');
    try {
      const users = this.getAll();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx === -1) throw new Error('Usuario no existe');

      // si viene password plano, rehash; si no, conservar
      const current = users[idx];
      const needsHash = user.password && user.password.length > 0 && user.password === (user as any)._plainPassword;
      const next: User = {
        ...user,
        password: needsHash ? this.encrypt.hash((user as any)._plainPassword) : current.password
      };

      users[idx] = next;
      this.saveAll(users);
      await this.toast.present('Usuario actualizado');
      return next;
    } catch (e: any) {
      await this.toast.present(e?.message || 'No se pudo actualizar');
      throw e;
    } finally {
      await this.loader.dismiss();
    }
  }

  getByEmail(email: string): User | null {
    return this.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getById(id: string): User | null {
    return this.getAll().find(u => u.id === id) || null;
  }
}
