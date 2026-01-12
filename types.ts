export enum JobStatus {
  RECEIVED = 'Received',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered'
}

// Unified Record: Every job contains the snapshots of customer and vehicle info
// Aligned with 'customers' table in SQL
export interface Job {
  id: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  vehicleNumber: string;
  brand?: string;
  model?: string;
  type?: string;
  color?: string;
  services?: string;
  dateIn: string;
  expectedDeliveryDate: string;
  charges?: number;
  status: JobStatus;
}

// Logical customer profile derived from the job history
export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  createdAt: string;
}

export type AppView = 'dashboard' | 'jobs' | 'customers' | 'add-job' | 'marketing' | 'reports' | 'inventory' | 'service' | 'suppliers' | 'invoices' | 'settings' | 'appointments' | 'branch';

export type UserRole = 'admin' | 'employee' | 'support' | 'accountant' | 'customer';

// Aligned with 'branches' table in SQL
export interface Branch {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address: string;
}

// Aligned with 'inventory' table in SQL
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  lastUpdated: string;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  purchaseDate: string;
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    amount: number;
  }[];
  totalAmount: number;
  notes?: string;
}

export interface WarrantyClaim {
  id: string;
  itemId: string;
  itemName: string;
  jobId?: string;
  customerName?: string;
  claimDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Resolved';
  notes?: string;
}

// Aligned with 'suppliers' table in SQL
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  mobile?: string;
  email?: string;
  address?: string;
  category?: string;
}

// Aligned with 'invoices' table in SQL (detailed version)
export interface Invoice {
  id: string;
  invoiceNumber?: string;
  invoiceFor?: string;
  jobId?: string;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  customerAddress?: string;
  date?: string;
  branch?: string;
  status?: 'Paid' | 'Unpaid' | 'Partial' | string;
  details?: string;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  grandTotal?: number;
  adjustmentAmount?: number;
  dueAmount?: number;
  notes?: string;
  isInternalNote?: boolean;
  isSharedWithCustomer?: boolean;
  items?: any; // JSONB
  couponNumber?: string;
  assignedTo?: string;
  repairCategory?: string;
  serviceType?: string;
  vehicleName?: string;
  plateNumber?: string;
  dateIn?: string;
  dateOut?: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerMobile: string;
  vehicleNumber: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface DashboardStats {
  todayTotal: number;
  wipCount: number;
  completedCount: number;
  pendingDelivery: number;
}