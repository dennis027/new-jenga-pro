import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SitesService } from '../../services/sites-service';
import { AppBarService } from '../../services/app-bar-service';
import regionsData from '../../../assets/JSON-Files/regions.json';

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

  sites: Site[] = [];
  loading = true;
  error: string | null = null;
  
  // Dialog state
  showDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  saving = false;
  
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
        id: 'add-site',
        icon: 'add',
        ariaLabel: 'Add Site',
        onClick: () => {
          this.openAddDialog();
        },
      },
      {
        id: 'refresh',
        icon: 'refresh',
        ariaLabel: 'Refresh Sites',
        onClick: () => {
          this.loadSites();
        },
      }
    ]);

    this.loadSites();
    console.log('Regions data:', regionsData);
  }

  loadSites() {
    this.loading = true;
    this.error = null;
    
    this.siteService.getUserSites().subscribe({
      next: (data) => {
        console.log('Sites data:', data);
        this.sites = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sites:', err);
        this.error = 'Failed to load sites. Please try again.';
        this.loading = false;
      }
    });
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
    this.showDialog = true;
  }

  openEditDialog(site: Site) {
    this.dialogMode = 'edit';
    this.editingSiteId = site.id || null;
    this.formData = {
      name: site.name,
      description: site.description,
      phone_number: site.phone_number,
      county: site.county,
      constituency: site.constituency,
      ward: site.ward
    };
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.formData = {
      name: '',
      description: '',
      phone_number: '',
      county: '',
      constituency: '',
      ward: ''
    };
    this.editingSiteId = null;
  }

  saveSite() {
    if (!this.formData.name.trim() || !this.formData.phone_number.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;

    const payload = {
      name: this.formData.name.trim(),
      description: this.formData.description.trim(),
      phone_number: this.formData.phone_number.trim(),
      county: this.formData.county.trim(),
      constituency: this.formData.constituency.trim(),
      ward: this.formData.ward.trim()
    };

    if (this.dialogMode === 'add') {
      this.siteService.addSite(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeDialog();
          this.loadSites();
        },
        error: (err) => {
          console.error('Error adding site:', err);
          alert('Failed to add site. Please try again.');
          this.saving = false;
        }
      });
    } else if (this.dialogMode === 'edit' && this.editingSiteId) {
      this.siteService.updateSite(this.editingSiteId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeDialog();
          this.loadSites();
        },
        error: (err) => {
          console.error('Error updating site:', err);
          alert('Failed to update site. Please try again.');
          this.saving = false;
        }
      });
    }
  }

  handleDeleteSite(site: Site) {
    if (!site.id) return;
    
    if (confirm(`Are you sure you want to delete "${site.name}"?`)) {
      this.siteService.deleteSite(site.id).subscribe({
        next: () => {
          this.loadSites();
        },
        error: (err) => {
          console.error('Error deleting site:', err);
          alert('Failed to delete site. Please try again.');
        }
      });
    }
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