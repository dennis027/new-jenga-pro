import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
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
export class Profile {
  private appBar = inject(AppBarService);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  isLoading = true;
  profilePicUrl: string | null = null;
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;
  showImageOptions = false;

  // Location data
  regions: County[] = regionsData as County[];
  constituencies: string[] = [];
  wards: string[] = [];

  ngOnInit() {
    this.appBar.setTitle('Update Profile');
    this.appBar.setBack(true);

    this.initializeForm();

    if (isPlatformBrowser(this.platformId) && this.tokenService.isLoggedIn()) {
      this.getLoggedInUser();
    } else if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
  }

private initializeForm() {
  this.profileForm = this.fb.group({
    fullName: ['', Validators.required],
    nationalId: ['', Validators.required],
    phone: ['', [Validators.required, this.phoneValidator]],
    county: ['', Validators.required],
    constituency: [{ value: '', disabled: true }, Validators.required], // Start disabled
    ward: [{ value: '', disabled: true }, Validators.required], // Start disabled
  });

  this.profileForm.get('county')?.valueChanges.subscribe(county => {
    this.onCountyChanged(county);
  });

  this.profileForm.get('constituency')?.valueChanges.subscribe(constituency => {
    this.onConstituencyChanged(constituency);
  });
}

  private phoneValidator(control: any) {
    if (!control.value) return { required: true };

    const cleanedPhone = control.value.replace(/[\s\-\(\)]/g, '');

    if (cleanedPhone.startsWith('254')) {
      if (cleanedPhone.length !== 12) return { invalidPhone: true };
    } else if (cleanedPhone.startsWith('0')) {
      if (cleanedPhone.length !== 10) return { invalidPhone: true };
    } else if (cleanedPhone.startsWith('7') || cleanedPhone.startsWith('1')) {
      if (cleanedPhone.length !== 9) return { invalidPhone: true };
    } else {
      return { invalidPhone: true };
    }

    if (!/^[0-9]+$/.test(cleanedPhone)) {
      return { invalidPhone: true };
    }

    return null;
  }

  private getLoggedInUser() {
    this.userService.getUserDetails().subscribe({
      next: (data) => {
        this.profileForm.patchValue({
          fullName: data.full_name || '',
          nationalId: data.national_id || '',
          phone: data.phone || ''
        });

        this.profilePicUrl = data.profile_pic || null;

        // Set location data with validation
        if (data.county) {
          const countyExists = this.regions.some(r => r.county_name === data.county);
          if (countyExists) {
            this.profileForm.patchValue({ county: data.county });
            this.onCountyChanged(data.county);

            if (data.constituency && this.constituencies.includes(data.constituency)) {
              this.profileForm.patchValue({ constituency: data.constituency });
              this.onConstituencyChanged(data.constituency);

              if (data.ward && this.wards.includes(data.ward)) {
                this.profileForm.patchValue({ ward: data.ward });
              }
            }
          }
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching user profile', err);
        this.isLoading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

onCountyChanged(county: string | null) {
  this.profileForm.patchValue({ constituency: '', ward: '' });
  this.constituencies = [];
  this.wards = [];

  const constituencyControl = this.profileForm.get('constituency');
  const wardControl = this.profileForm.get('ward');

  if (county) {
    const countyData = this.regions.find(r => r.county_name === county);
    if (countyData) {
      this.constituencies = countyData.constituencies.map(c => c.constituency_name);
      constituencyControl?.enable(); // Enable when county is selected
    }
  } else {
    constituencyControl?.disable(); // Disable when no county
    wardControl?.disable(); // Also disable ward
  }
}

onConstituencyChanged(constituency: string | null) {
  this.profileForm.patchValue({ ward: '' });
  this.wards = [];

  const wardControl = this.profileForm.get('ward');

  if (constituency && this.profileForm.value.county) {
    const countyData = this.regions.find(r => r.county_name === this.profileForm.value.county);
    if (countyData) {
      const constituencyData = countyData.constituencies.find(c => c.constituency_name === constituency);
      if (constituencyData) {
        this.wards = constituencyData.wards;
        wardControl?.enable(); // Enable when constituency is selected
      }
    }
  } else {
    wardControl?.disable(); // Disable when no constituency
  }
}
  toggleImageOptions() {
    this.showImageOptions = !this.showImageOptions;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result;
      };
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
    if (this.selectedImagePreview) {
      return this.selectedImagePreview;
    }
    if (this.profilePicUrl) {
      return `${this.getImgBaseUrl()}${this.profilePicUrl}`;
    }
    return '';
  }

  private getImgBaseUrl(): string {
    // Replace with your actual image base URL from environment
    return 'https://your-api-url.com';
  }

  onSubmit() {
    if (!this.profileForm.valid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formData = new FormData();
    formData.append('full_name', this.profileForm.value.fullName);
    formData.append('national_id', this.profileForm.value.nationalId);
    formData.append('phone', this.profileForm.value.phone);
    formData.append('county', this.profileForm.value.county);
    formData.append('constituency', this.profileForm.value.constituency);
    formData.append('ward', this.profileForm.value.ward);

    if (this.selectedImage) {
      formData.append('profile_pic', this.selectedImage);
    }

    // Call your update service here
    this.userService.updateUserDetails(formData).subscribe({
      next: () => {
        // Show success message and navigate
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error updating profile', err);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}