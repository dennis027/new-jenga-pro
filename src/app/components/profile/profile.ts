import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppBarService } from '../../services/app-bar-service';
import { TokenService } from '../../services/token-service';
import { UserService } from '../../services/user-service';
import regionsData from '../../../assets/JSON-Files/regions.json';

interface County {
  county_code: number;
  county_name: string;
  constituencies: Constituency[];
}

interface Constituency {
  constituency_name: string;
  wards: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private appBar = inject(AppBarService);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  profilePicUrl: string | null = null;
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;
  showImageOptions = false;

  regions: County[] = regionsData as County[];
  constituencies: string[] = [];
  wards: string[] = [];

  ngOnInit() {
    this.appBar.setTitle('Update Profile');
    this.appBar.setBack(true);
    this.initializeForm();

    if (isPlatformBrowser(this.platformId)) {
      if (!this.tokenService.isLoggedIn()) {
        this.router.navigate(['/login']);
      } else {
        this.getLoggedInUser();
      }
    } else {
      this.isLoading = false;
    }
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      nationalId: ['', Validators.required],
      phone: ['', [Validators.required, this.phoneValidator]],
      county: ['', Validators.required],
      constituency: [{ value: '', disabled: true }, Validators.required],
      ward: [{ value: '', disabled: true }, Validators.required],
    });

    // Watch for manual changes to reset children
    this.profileForm.get('county')?.valueChanges.subscribe(county => {
      this.onCountyChanged(county, true);
    });

    this.profileForm.get('constituency')?.valueChanges.subscribe(constituency => {
      this.onConstituencyChanged(constituency, true);
    });
  }

  private getLoggedInUser() {
    this.userService.getUserDetails().subscribe({
      next: (data) => {
        // 1. Set basic info
        this.profileForm.patchValue({
          fullName: data.full_name || '',
          nationalId: data.national_id || '',
          phone: data.phone || ''
        });

        this.profilePicUrl = data.profile_pic || null;

        // 2. Cascade Location Data
        if (data.county) {
          this.onCountyChanged(data.county, false);
          this.profileForm.get('county')?.setValue(data.county, { emitEvent: false });

          if (data.constituency) {
            this.onConstituencyChanged(data.constituency, false);
            this.profileForm.get('constituency')?.setValue(data.constituency, { emitEvent: false });

            if (data.ward) {
              this.profileForm.get('ward')?.setValue(data.ward, { emitEvent: false });
            }
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.isLoading = false;
      }
    });
  }

  onCountyChanged(county: string | null, shouldResetChildren: boolean) {
    const constituencyCtrl = this.profileForm.get('constituency');
    const wardCtrl = this.profileForm.get('ward');

    if (shouldResetChildren) {
      this.profileForm.patchValue({ constituency: '', ward: '' }, { emitEvent: false });
      wardCtrl?.disable();
    }

    if (county) {
      const countyData = this.regions.find(r => r.county_name === county);
      this.constituencies = countyData ? countyData.constituencies.map(c => c.constituency_name) : [];
      constituencyCtrl?.enable();
    } else {
      constituencyCtrl?.disable();
    }
  }

  onConstituencyChanged(constituency: string | null, shouldResetChildren: boolean) {
    const wardCtrl = this.profileForm.get('ward');
    
    if (shouldResetChildren) {
      this.profileForm.patchValue({ ward: '' }, { emitEvent: false });
    }

    if (constituency && this.profileForm.get('county')?.value) {
      const countyData = this.regions.find(r => r.county_name === this.profileForm.get('county')?.value);
      const constituencyData = countyData?.constituencies.find(c => c.constituency_name === constituency);
      this.wards = constituencyData ? constituencyData.wards : [];
      wardCtrl?.enable();
    } else {
      wardCtrl?.disable();
    }
  }

  // --- Image Handlers ---
  toggleImageOptions() { this.showImageOptions = !this.showImageOptions; }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => this.selectedImagePreview = e.target.result;
      reader.readAsDataURL(this.selectedImage);
      this.showImageOptions = false;
    }
  }

  removeImage() {
    this.selectedImage = null;
    this.selectedImagePreview = null;
    this.profilePicUrl = null;
    this.showImageOptions = false;
  }

  getCurrentImageUrl(): string {
    if (this.selectedImagePreview) return this.selectedImagePreview;
    if (this.profilePicUrl) return `https://your-api-url.com${this.profilePicUrl}`;
    return '';
  }

  private phoneValidator(control: any) {
    if (!control.value) return null;
    const cleaned = control.value.replace(/\D/g, '');
    if (cleaned.startsWith('254') && cleaned.length === 12) return null;
    if (cleaned.startsWith('0') && cleaned.length === 10) return null;
    if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) return null;
    return { invalidPhone: true };
  }

  onSubmit() {
    if (this.profileForm.invalid || this.isSaving) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formData = new FormData();
    const val = this.profileForm.getRawValue(); // Gets values even from disabled fields

    formData.append('full_name', val.fullName);
    formData.append('national_id', val.nationalId);
    formData.append('phone', val.phone);
    formData.append('county', val.county);
    formData.append('constituency', val.constituency);
    formData.append('ward', val.ward);

    if (this.selectedImage) formData.append('profile_pic', this.selectedImage);

    this.userService.updateUserDetails(formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Update failed', err);
      }
    });
  }
}