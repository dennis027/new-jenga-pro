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
import { AllGigs } from './components/all-gigs/all-gigs';
import { VerifyGigs } from './components/verify-gigs/verify-gigs';
import { ManageWorkers } from './components/manage-workers/manage-workers';
import { Reports } from './components/reports/reports';
import { AddGigTypes } from './components/add-gig-types/add-gig-types';
import { AddSites } from './components/add-sites/add-sites';
import { MpesaPayments } from './components/mpesa-payments/mpesa-payments';
import { Analytics } from './components/analytics/analytics';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
  {path:'home',component:Home},
  {path:'login',component:Login},
  {path:'register',component:Register},
  {path:'email-verify',component:EmailVerification},
  
  {path:'main-menu',canActivate: [AuthGuard],component:Main, 
    children:[
        {path:'',canActivate: [AuthGuard],component:JengaDash},
        {path:'all-gigs',canActivate: [AuthGuard],component:AllGigs},
        {path:'verify-gigs',canActivate: [AuthGuard],component:VerifyGigs},
        {path:'manage-workers',canActivate: [AuthGuard],component:ManageWorkers},
        {path:'reports',canActivate: [AuthGuard],component:Reports},
        {path:'add-gig-type',canActivate: [AuthGuard],component:AddGigTypes},
        {path:'add-sites',canActivate: [AuthGuard],component:AddSites},
        {path:'MPESA-Payments',canActivate: [AuthGuard],component:MpesaPayments},
        {path:'analytics',canActivate: [AuthGuard],component:Analytics},
        {path:'profile',canActivate: [AuthGuard],component:Profile},

        { path: '404', component: Dash404 },
        { path: '**', redirectTo: '/404' } 
   ]},


  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/login' } 
  
];
 