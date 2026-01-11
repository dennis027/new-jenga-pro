import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { AuthGuard } from './guards/auth-guard';
import { Main } from './components/main/main';
import { EmailVerification } from './components/auth/email-verification/email-verification';
import { Dash404 } from './components/dash-404/dash-404';
import { JengaDash } from './components/jenga-dash/jenga-dash';

export const routes: Routes = [
  {path:'home',component:Home},
  {path:'login',component:Login},
  {path:'register',component:Register},
  {path:'email-verify',component:EmailVerification},
  
  {path:'main-menu',canActivate: [AuthGuard],component:Main, 
    children:[
        {path:'',canActivate: [AuthGuard],component:JengaDash},


        { path: '404', component: Dash404 },
        { path: '**', redirectTo: '/404' } 
   ]},


  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/404' } 
  
];
 