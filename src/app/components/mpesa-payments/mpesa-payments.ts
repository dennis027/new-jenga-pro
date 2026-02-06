import { Component, inject, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppBarService } from '../../services/app-bar-service';
import { MpesaService } from '../../services/mpesa-service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface MpesaTransaction {
  id: number;
  amount: number;
  mpesa_receipt_number: string;
  transaction_date: string;
  phone_number: string;
  status: string;
}

@Component({
  selector: 'app-mpesa-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mpesa-payments.html',
  styleUrl: './mpesa-payments.css',
})
export class MpesaPayments implements OnInit, OnDestroy {
  private appBar = inject(AppBarService);
  private platformId = inject(PLATFORM_ID);
  private mpesaService = inject(MpesaService);
  private router = inject(Router);
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


  mpesaMessages: MpesaTransaction[] = [];
  filteredMessages: MpesaTransaction[] = [];
  isLoading = false;

  // Filter properties
  filterPhone: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';
  filterAmount: string = '';
  filterReceipt: string = '';

  // Dialog states
  showPaymentDialog = false;
  showFilterDialog = false;

  // Payment form
  paymentPhone: string = '';
  paymentAmount: number | null = null;

  constructor() {}

  ngOnInit(): void {
    // Set AppBar configuration first
    this.appBar.setTitle('Mpesa Payments');
    this.appBar.setBack(true);
    
    // Set mobile action buttons
    this.appBar.setActions([
      { 
        id: 'filter-payment',
        icon: 'filter_list',
        ariaLabel: 'Filter',
        onClick: () => {
          this.openFilterDialog();
        }
      },
      { 
        id: 'refresh-payments',
        icon: 'refresh',
        ariaLabel: 'Refresh',
        onClick: () => {
          this.refresh();
        },
      }
    ]);

    // Fetch messages after AppBar setup
    if (isPlatformBrowser(this.platformId)) {
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.fetchMpesaMessages();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    // Clean up AppBar state
    this.appBar.setActions([]);
    this.appBar.setBack(false);
  }

  fetchMpesaMessages(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.mpesaService.getSingleMessages().subscribe({
      next: (data) => {
        this.mpesaMessages = data.transactions;
        this.filteredMessages = [...this.mpesaMessages];
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('Fetched Mpesa messages:', this.mpesaMessages);
      },
      error: (err) => {
        console.error('Error fetching Mpesa messages:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    }); 
  }

  applyFilters(): void {
    this.filteredMessages = this.mpesaMessages.filter(msg => {
      let matches = true;

      if (this.filterPhone) {
        matches = matches && msg.phone_number.includes(this.filterPhone.replace(/^0/, '254'));
      }

      if (this.filterAmount) {
        matches = matches && msg.amount.toString().includes(this.filterAmount);
      }

      if (this.filterReceipt) {
        matches = matches && msg.mpesa_receipt_number.toLowerCase().includes(this.filterReceipt.toLowerCase());
      }

      if (this.filterStartDate) {
        matches = matches && new Date(msg.transaction_date) >= new Date(this.filterStartDate);
      }

      if (this.filterEndDate) {
        matches = matches && new Date(msg.transaction_date) <= new Date(this.filterEndDate);
      }

      return matches;
    });
  }

  openPaymentDialog(): void {
    this.showPaymentDialog = true;
    this.paymentPhone = '';
    this.paymentAmount = null;
  }

  closePaymentDialog(): void {
    this.showPaymentDialog = false;
  }

  sendStkPush(): void {
    if (!this.paymentPhone || !this.paymentAmount || this.paymentAmount <= 0) {
      return;
    }

    let phone = this.paymentPhone.trim();
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    } else if (phone.startsWith('+254')) {
      phone = '254' + phone.substring(4);
    }

    const data = {
      phone_number: phone,
      amount: this.paymentAmount
    }

    this.mpesaService.stkPush(data).subscribe({
      next: (response) => {
        console.log('STK Push initiated successfully:', response);
        this.showSuccess('STK Push initiated. Please check your phone to complete the payment.');
        this.closePaymentDialog();
        this.fetchMpesaMessages();
      },
      error: (err) => {
        console.error('Error initiating STK Push:', err);
        this.showError('Failed to initiate STK Push. Please try again.');
      }
    }); 
  }

  openFilterDialog(): void {
    this.showFilterDialog = true;
  }

  closeFilterDialog(): void {
    this.showFilterDialog = false;
  }

  applyFilterDialog(): void {
    this.applyFilters();
    this.closeFilterDialog();
  }

  clearFilters(): void {
    this.filterPhone = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterAmount = '';
    this.filterReceipt = '';
    this.filteredMessages = [...this.mpesaMessages];
    this.closeFilterDialog();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  }

  formatPhone(phone: string): string {
    if (phone.startsWith('254')) {
      return '0' + phone.substring(3);
    }
    return phone;
  }

  refresh(): void {
    this.fetchMpesaMessages();
  }
}