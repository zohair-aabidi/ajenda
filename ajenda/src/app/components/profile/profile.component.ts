import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-full flex-col px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-2xl font-bold leading-9 tracking-tight">Mon Profil</h2>
      </div>

      <div class="mt-10 mx-auto w-full max-w-md">
        <div class="bg-white shadow-md rounded-lg p-6">
          <div class="mb-4">
            <h3 class="text-lg font-medium">Informations personnelles</h3>
          </div>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500">Nom d'utilisateur</p>
              <p class="font-medium">{{ currentUser.username }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium">{{ currentUser.email }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Rôles</p>
              <ul class="list-disc ml-5">
                <li *ngFor="let role of currentUser.roles">{{ role }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: any = {};

  constructor(private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.currentUser = this.tokenStorage.getUser();
  }
} 