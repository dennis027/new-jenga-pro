import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { FundiDash } from './components/fundi-dash/fundi-dash';
import { JengaDash } from './components/jenga-dash/jenga-dash';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';

export const routes: Routes = [
  {path:'home',component:Home},
  {path:'login',component:Login},
  {path:'register',component:Register},
  {path:'fundi-dashboard',component:FundiDash},
  {path:'jemga-dashboard',component:JengaDash},
  


  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/404' } 
  
];
