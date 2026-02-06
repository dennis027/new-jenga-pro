import { Component, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SitesService } from '../../services/sites-service';
import { AppBarService } from '../../services/app-bar-service';
import regionsData from '../../../assets/JSON-Files/regions.json';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Site {
  id?: number;
  name: string;
  description: string;
  county: string;
  constituency: string;
  ward: string;
  phone_number: string;
  created_at?: string;
  is_active?: boolean;
  owner?: number;
}

interface Constituency {
  constituency_name: string;
  wards: string[];
}

interface County {
  county_code: number;
  county_name: string;
  constituencies: Constituency[];
}

@Component({
  selector: 'app-add-sites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-sites.html',
  styleUrl: './add-sites.css',
})
export class AddSites {
  private siteService = inject(SitesService);
  private appBar = inject(AppBarService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef); 
  private snackBar = inject(MatSnackBar);

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }


  sites: Site[] = [];
  loading = true;
  error: string | null = null;
  
  // Dialog state
  showDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  saving = false;
  
  // Region data
  counties: County[] = regionsData as County[];
  availableConstituencies: Constituency[] = [];
  availableWards: string[] = [];
  
  // Form data
  formData: Site = {
    name: '',
    description: '',
    phone_number: '',
    county: '',
    constituency: '',
    ward: ''
  };
  
  editingSiteId: number | null = null;

  ngOnInit() {
    this.appBar.setTitle('Manage Sites');
    this.appBar.setBack(true);

    this.appBar.setActions([
      {
        id: 'refresh',
        icon: 'refresh',
        ariaLabel: 'Refresh Sites',
        onClick: () => {
          this.loadSites();
        },
      }
    ]);

    if (isPlatformBrowser(this.platformId)) {
      this.loadSites();
    }
  }

  loadSites() {
    this.loading = true;
    this.error = null;
    
    // Explicitly trigger change detection because we are 
    // changing 'loading' during the lifecycle check.
    this.cdr.detectChanges();

    this.siteService.getUserSites().subscribe({
      next: (data) => {
        this.sites = data;
        this.loading = false;
        this.cdr.detectChanges(); // Ensure UI updates when data arrives
      },
      error: (err) => {
        console.error('Error loading sites:', err);
        this.loading = false;
        
        if (err.status === 0) {
          this.error = 'Network error: Please check your internet connection.';
        } else if (err.status === 401) {
          this.error = 'Unauthorized: Please log in again.';
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load sites. Please try again.';
        }
        this.cdr.detectChanges();

        this.showError(this.error);
      }
    });
  }

  onCountyChange() {
    this.formData.constituency = '';
    this.formData.ward = '';
    this.availableWards = [];
    
    const selectedCounty = this.counties.find(
      county => county.county_name === this.formData.county
    );
    
    this.availableConstituencies = selectedCounty ? selectedCounty.constituencies : [];
  }

  onConstituencyChange() {
    this.formData.ward = '';
    
    const selectedConstituency = this.availableConstituencies.find(
      constituency => constituency.constituency_name === this.formData.constituency
    );
    
    this.availableWards = selectedConstituency ? selectedConstituency.wards : [];
  }

  openAddDialog() {
    this.dialogMode = 'add';
    this.editingSiteId = null;
    this.formData = {
      name: '',
      description: '',
      phone_number: '',
      county: '',
      constituency: '',
      ward: ''
    };
    this.availableConstituencies = [];
    this.availableWards = [];
    this.showDialog = true;
  }

  openEditDialog(site: Site) {
    this.dialogMode = 'edit';
    this.editingSiteId = site.id || null;
    this.formData = { ...site }; // Shallow copy to avoid direct mutation
    
    const selectedCounty = this.counties.find(c => c.county_name === site.county);
    if (selectedCounty) {
      this.availableConstituencies = selectedCounty.constituencies;
      const selectedConstituency = this.availableConstituencies.find(
        c => c.constituency_name === site.constituency
      );
      if (selectedConstituency) {
        this.availableWards = selectedConstituency.wards;
      }
    }
    
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.editingSiteId = null;
    this.cdr.detectChanges(); // Ensures the dialog DOM is cleaned up properly
  }

  saveSite() {
    if (!this.formData.name.trim() || !this.formData.phone_number.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;
    const payload = { ...this.formData };

    const request = this.dialogMode === 'add' 
      ? this.siteService.addSite(payload)
      : this.siteService.updateSite(this.editingSiteId!, payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeDialog();
        this.loadSites();
        this.showSuccess(`Site ${this.dialogMode === 'add' ? 'added' : 'updated'} successfully!`);
      },
      error: (err) => {
        console.error('Error saving site:', err);
        alert('Failed to save site. Please try again.');
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleDeleteSite(site: Site) {
    if (!site.id || !confirm(`Are you sure you want to delete "${site.name}"?`)) return;
    
    this.siteService.deleteSite(site.id).subscribe({
      next: () => this.loadSites(),
      error: (err) => {
        console.error('Error deleting site:', err);
        alert('Failed to delete site.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}