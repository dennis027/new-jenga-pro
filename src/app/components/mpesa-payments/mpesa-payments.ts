import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MpesaTransaction {
  id: number;
  amount: string | number;
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
export class MpesaPayments implements OnInit {
  mpesaMessages: MpesaTransaction[] = [];
  filteredMessages: MpesaTransaction[] = [];
  isLoading = false;
  
  // Dialog states
  showPaymentDialog = false;
  showFilterDialog = false;
  
  // Payment form
  paymentForm = {
    phoneNumber: '',
    amount: ''
  };
  
  // Filter form
  filterForm = {
    phone: '',
    amount: '',
    receipt: '',
    startDate: '',
    endDate: ''
  };
  
  saving = false;

  // Dummy data
  private dummyData: MpesaTransaction[] = [
    {
      id: 1,
      amount: 1500,
      mpesa_receipt_number: 'SHK7G8X9Y2',
      transaction_date: '2026-01-21T10:30:00Z',
      phone_number: '254712345678',
      status: 'completed'
    },
    {
      id: 2,
      amount: 2500,
      mpesa_receipt_number: 'TLM9K2P3Q4',
      transaction_date: '2026-01-20T14:15:00Z',
      phone_number: '254723456789',
      status: 'completed'
    },
    {
      id: 3,
      amount: 500,
      mpesa_receipt_number: 'UMN4R5S6T7',
      transaction_date: '2026-01-20T09:45:00Z',
      phone_number: '254734567890',
      status: 'completed'
    },
    {
      id: 4,
      amount: 3200,
      mpesa_receipt_number: 'VOP8W9X1Y2',
      transaction_date: '2026-01-19T16:20:00Z',
      phone_number: '254745678901',
      status: 'completed'
    },
    {
      id: 5,
      amount: 1000,
      mpesa_receipt_number: 'WQR3Z4A5B6',
      transaction_date: '2026-01-19T11:00:00Z',
      phone_number: '254756789012',
      status: 'completed'
    },
    {
      id: 6,
      amount: 4500,
      mpesa_receipt_number: 'XST7C8D9E1',
      transaction_date: '2026-01-18T13:30:00Z',
      phone_number: '254767890123',
      status: 'completed'
    },
    {
      id: 7,
      amount: 800,
      mpesa_receipt_number: 'YUV2F3G4H5',
      transaction_date: '2026-01-18T08:15:00Z',
      phone_number: '254778901234',
      status: 'completed'
    },
    {
      id: 8,
      amount: 2100,
      mpesa_receipt_number: 'ZWX6I7J8K9',
      transaction_date: '2026-01-17T15:45:00Z',
      phone_number: '254789012345',
      status: 'completed'
    }
  ];

  ngOnInit() {
    this.loadMpesaMessages();
  }

  loadMpesaMessages() {
    this.isLoading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      this.mpesaMessages = [...this.dummyData];
      this.applyFiltersToData();
      this.isLoading = false;
    }, 500);
  }

  applyFiltersToData() {
    this.filteredMessages = this.mpesaMessages.filter(msg => {
      let matches = true;

      if (this.filterForm.phone) {
        matches = matches && msg.phone_number.includes(this.filterForm.phone);
      }

      if (this.filterForm.amount) {
        matches = matches && msg.amount.toString() === this.filterForm.amount;
      }

      if (this.filterForm.receipt) {
        matches = matches && msg.mpesa_receipt_number.toLowerCase().includes(
          this.filterForm.receipt.toLowerCase()
        );
      }

      if (this.filterForm.startDate) {
        const msgDate = new Date(msg.transaction_date);
        const startDate = new Date(this.filterForm.startDate);
        matches = matches && msgDate >= startDate;
      }

      if (this.filterForm.endDate) {
        const msgDate = new Date(msg.transaction_date);
        const endDate = new Date(this.filterForm.endDate);
        matches = matches && msgDate <= endDate;
      }

      return matches;
    });
  }

  openPaymentDialog() {
    this.paymentForm = { phoneNumber: '', amount: '' };
    this.showPaymentDialog = true;
  }

  closePaymentDialog() {
    this.showPaymentDialog = false;
    this.paymentForm = { phoneNumber: '', amount: '' };
  }

  sendStkPush() {
    let phone = this.paymentForm.phoneNumber.trim();
    const amount = parseFloat(this.paymentForm.amount);

    if (!phone || amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    // Format phone number
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    } else if (phone.startsWith('+254')) {
      phone = '254' + phone.substring(4);
    }

    this.saving = true;

    // Simulate API call
    setTimeout(() => {
      // Add new transaction to dummy data
      const newTransaction: MpesaTransaction = {
        id: this.mpesaMessages.length + 1,
        amount: amount,
        mpesa_receipt_number: this.generateReceiptNumber(),
        transaction_date: new Date().toISOString(),
        phone_number: phone,
        status: 'completed'
      };

      this.mpesaMessages.unshift(newTransaction);
      this.applyFiltersToData();
      
      this.saving = false;
      this.closePaymentDialog();
      alert('STK push sent successfully');
    }, 1000);
  }

  generateReceiptNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  openFilterDialog() {
    this.showFilterDialog = true;
  }

  closeFilterDialog() {
    this.showFilterDialog = false;
  }

  applyFilters() {
    this.applyFiltersToData();
    this.closeFilterDialog();
  }

  clearFilters() {
    this.filterForm = {
      phone: '',
      amount: '',
      receipt: '',
      startDate: '',
      endDate: ''
    };
    this.applyFiltersToData();
    this.closeFilterDialog();
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  formatPhone(phone: string): string {
    if (phone.startsWith('254')) {
      return '0' + phone.substring(3);
    }
    return phone;
  }
}