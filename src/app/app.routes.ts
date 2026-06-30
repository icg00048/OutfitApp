import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'tabs',
    component: LayoutComponent,
    children: [
      { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
      { path: 'camera', loadComponent: () => import('./shared/camera/camera.component').then(m => m.CameraComponent) },
      { path: 'outfits', loadComponent: () => import('./outfits-saved/outfits-saved.page').then(m => m.OutfitsSavedPage) },

      { path: '', redirectTo: '/tabs/home', pathMatch: 'full' }
    ]
  },
  {
    path: 'outfits/recommendations',
    loadComponent: () =>
      import('./outfits-recommendations/outfits-recommendations.page').then(m => m.OutfitsRecommendationsPage)
  },
  {
    path: 'item/:id',
    loadComponent: () => import('./item-profile/item-profile.page').then(m => m.ItemProfilePage)
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];