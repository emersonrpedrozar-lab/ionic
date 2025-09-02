import { Injectable } from '@angular/core';
import { StorageProvider } from '../shared/providers/storage.provider';
import { EncryptProvider } from '../shared/providers/encrypt.provider';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { ToastProvider } from '../shared/providers/toast.provider';
import { LoaderProvider } from '../shared/providers/loader.provider';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'SESSION_USER';

  constructor(
    private storage: StorageProvider,
    private encrypt: EncryptProvider,
    private users: UserService,
    private toast: ToastProvider,
    private loader: LoaderProvider
  ) {}

  get currentUser(): User | null {
    return this.storage.get<User>(this.SESSION_KEY);
  }

  isLogged(): boolean {
    return !!this.currentUser;
  }

  async login(email: string, password: string): Promise<User> {
    await this.loader.present('Validando credenciales...');
    try {
      const user = this.users.getByEmail(email);
      if (!user) throw new Error('Usuario no encontrado');

      const ok = this.encrypt.compare(password, user.password);
      if (!ok) throw new Error('Credenciales inválidas');

      this.storage.set(this.SESSION_KEY, user);
      await this.toast.present('Sesión iniciada');
      return user;
    } catch (e: any) {
      await this.toast.present(e?.message || 'No se pudo iniciar sesión');
      throw e;
    } finally {
      await this.loader.dismiss();
    }
  }

  async logout(): Promise<void> {
    await this.loader.present('Cerrando sesión...');
    try {
      this.storage.remove(this.SESSION_KEY);
      await this.toast.present('Sesión cerrada');
    } finally {
      await this.loader.dismiss();
    }
  }

  setSession(user: User): void {
    this.storage.set(this.SESSION_KEY, user);
  }
}
