import { Injectable, signal } from '@angular/core';

export interface AppBarAction {
  id: string;
  icon: string;
  ariaLabel: string;
  onClick: () => void;
}

@Injectable({ providedIn: 'root' })
export class AppBarService {
  title = signal('FundiPro');
  showBack = signal(false);
  actions = signal<AppBarAction[]>([]);

  setTitle(title: string) {
    this.title.set(title);
  }

  setBack(show: boolean) {
    this.showBack.set(show);
  }

  setActions(actions: AppBarAction[]) {
    this.actions.set(actions);
  }

  clearActions() {
    this.actions.set([]);
  }
}
