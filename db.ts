import { createClient } from '@supabase/supabase-js';
import { Job, JobStatus, Customer, InventoryItem, WarrantyClaim, Supplier, Invoice, Purchase, Branch } from './types';

const SUPABASE_URL = 'https://rksdqmzzzfikhbhrfkdg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sNI3AcRZ8sDn3YRsv7ERFg_fICeHJjG';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STORAGE_KEYS = {
  JOBS: 'autocare_flat_jobs',
  CONFIG: 'autocare_config',
  INVENTORY: 'autocare_inventory',
  WARRANTY_CLAIMS: 'autocare_warranty_claims',

  SUPPLIERS: 'autocare_suppliers',
  INVOICES: 'autocare_invoices',
  PURCHASES: 'autocare_purchases',
  BRANCHES: 'autocare_branches'
};

export interface ShopConfig {
  groupInviteLink: string;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  shopEmail?: string;
  termsAndConditions?: string;
}

let _jobs: Job[] = [];
let _inventory: InventoryItem[] = [];
let _warrantyClaims: WarrantyClaim[] = [];

let _suppliers: Supplier[] = [];
let _invoices: Invoice[] = [];
let _purchases: Purchase[] = [];
let _branches: Branch[] = [];
let _config: ShopConfig = { groupInviteLink: '' };

const normalizeDate = (val: any): string => {
  if (!val) return new Date().toISOString().split('T')[0];
  if (!isNaN(val) && !String(val).includes('-')) {
    const d = new Date(Number(val));
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
};

export const db = {
  init: async () => {
    try {
      const results = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('config').select('*').eq('id', 'main').single(),
        supabase.from('inventory').select('*'),
        supabase.from('warranty_claims').select('*'),

        supabase.from('suppliers').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('purchases').select('*'),
        supabase.from('branches').select('*')
      ]);

      const { data: jobs } = results[0];
      const { data: configs } = results[1];
      const { data: inventoryData } = results[2];


      const { data: claimsData } = results[3];
      const { data: suppliersData } = results[4];
      const { data: invoicesData } = results[5];
      const { data: purchasesData } = results[6];
      const { data: branchesData } = results[7];

      _jobs = (jobs || []).map(j => ({
        ...j,
        dateIn: normalizeDate(j.dateIn),
        expectedDeliveryDate: normalizeDate(j.expectedDeliveryDate)
      }));

      if (configs) _config = configs as unknown as ShopConfig;
      if (inventoryData) _inventory = inventoryData as InventoryItem[];
      if (claimsData) _warrantyClaims = claimsData as WarrantyClaim[];

      if (suppliersData) _suppliers = suppliersData as Supplier[];
      if (invoicesData) _invoices = invoicesData as Invoice[];
      if (purchasesData) _purchases = purchasesData as Purchase[];
      if (branchesData) {
        _branches = branchesData.map((b: any) => ({
          id: b.id,
          name: b.name,
          contactNumber: b.contactnumber || b.contactNumber, // Handle both cases
          email: b.email,
          country: b.country,
          state: b.state,
          city: b.city,
          address: b.address
        }));
      }

      console.log('Database synchronized with Supabase successfully');
    } catch (error: any) {
      console.error('Initial database sync failed:', error.message || error);
      _jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
      _inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
      _warrantyClaims = JSON.parse(localStorage.getItem(STORAGE_KEYS.WARRANTY_CLAIMS) || '[]');

      _suppliers = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || '[]');
      _invoices = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
      _purchases = JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASES) || '[]');
      _branches = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANCHES) || '[]');
      _config = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '{"groupInviteLink":""}');
    }
  },

  getJobs: (): Job[] => _jobs,
  saveJob: async (job: Job) => {
    const list = [..._jobs];
    const index = list.findIndex(j => j.id === job.id);
    if (index > -1) list[index] = job;
    else list.push(job);
    _jobs = list;
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(list));

    const { error } = await supabase.from('customers').upsert({
      id: job.id,
      customerName: job.customerName,
      customerMobile: job.customerMobile,
      customerAddress: job.customerAddress,
      vehicleNumber: job.vehicleNumber,
      brand: job.brand,
      model: job.model,
      type: job.type,
      color: job.color,
      services: job.services,
      dateIn: job.dateIn,
      expectedDeliveryDate: job.expectedDeliveryDate,
      charges: job.charges,
      status: job.status
    });
    if (error) {
      console.error('Error saving job to Supabase:', error.message);
      throw error;
    }
  },

  getCustomers: (): Customer[] => {
    const map = new Map<string, Customer>();
    _jobs.forEach(job => {
      if (!map.has(job.customerMobile)) {
        map.set(job.customerMobile, {
          id: job.id,
          name: job.customerName,
          mobile: job.customerMobile,
          address: job.customerAddress || '',
          createdAt: job.dateIn
        });
      }
    });
    return Array.from(map.values());
  },

  updateJobStatus: async (jobId: string, status: JobStatus) => {
    const job = _jobs.find(j => j.id === jobId);
    if (job) {
      job.status = status;
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(_jobs));
      const { error } = await supabase.from('customers').update({ status }).eq('id', jobId);
      if (error) {
        console.error('Error updating job status in Supabase:', error.message);
        throw error;
      }
      return job;
    }
    return null;
  },

  getConfig: (): ShopConfig => _config,
  saveConfig: async (config: ShopConfig) => {
    _config = config;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    await supabase.from('config').upsert({ id: 'main', ...config });
  },

  getInventory: (): InventoryItem[] => _inventory,
  saveInventoryItem: async (item: InventoryItem) => {
    const list = [..._inventory];
    const index = list.findIndex(i => i.id === item.id);
    if (index > -1) list[index] = item;
    else list.push(item);
    _inventory = list;
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
    const { error } = await supabase.from('inventory').upsert(item);
    if (error) {
      console.error('Error saving inventory item to Supabase:', error.message);
      throw error;
    }
  },
  deleteInventoryItem: async (id: string) => {
    _inventory = _inventory.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(_inventory));
    await supabase.from('inventory').delete().eq('id', id);
  }, getWarrantyClaims: (): WarrantyClaim[] => _warrantyClaims,
  saveWarrantyClaim: async (claim: WarrantyClaim) => {
    const list = [..._warrantyClaims];
    const index = list.findIndex(c => c.id === claim.id);
    if (index > -1) list[index] = claim;
    else list.push(claim);
    _warrantyClaims = list;
    localStorage.setItem(STORAGE_KEYS.WARRANTY_CLAIMS, JSON.stringify(list));
    const { error } = await supabase.from('warranty_claims').upsert(claim);
    if (error) {
      console.error('Error saving warranty claim to Supabase:', error.message);
      throw error;
    }
  },
  deleteWarrantyClaim: async (id: string) => {
    _warrantyClaims = _warrantyClaims.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.WARRANTY_CLAIMS, JSON.stringify(_warrantyClaims));
    await supabase.from('warranty_claims').delete().eq('id', id);
  },
  getSuppliers: (): Supplier[] => _suppliers,
  saveSupplier: async (supplier: Supplier) => {
    const list = [..._suppliers];
    const index = list.findIndex(s => s.id === supplier.id);
    if (index > -1) list[index] = supplier;
    else list.push(supplier);
    _suppliers = list;
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));
    const { error } = await supabase.from('suppliers').upsert(supplier);
    if (error) {
      console.error('Error saving supplier to Supabase:', error.message);
      throw error;
    }
  },
  deleteSupplier: async (id: string) => {
    _suppliers = _suppliers.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(_suppliers));
    await supabase.from('suppliers').delete().eq('id', id);
  },

  getInvoices: (): Invoice[] => _invoices,
  saveInvoice: async (invoice: Invoice) => {
    const list = [..._invoices];
    const index = list.findIndex(i => i.id === invoice.id);
    if (index > -1) list[index] = invoice;
    else list.push(invoice);
    _invoices = list;
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(list));
    const { error } = await supabase.from('invoices').upsert(invoice);
    if (error) {
      console.error('Error saving invoice to Supabase:', error.message);
      throw error;
    }
  },
  deleteInvoice: async (id: string) => {
    _invoices = _invoices.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(_invoices));
    await supabase.from('invoices').delete().eq('id', id);
  },

  getPurchases: (): Purchase[] => _purchases,
  savePurchase: async (purchase: Purchase) => {
    const list = [..._purchases];
    const index = list.findIndex(p => p.id === purchase.id);
    if (index > -1) list[index] = purchase;
    else list.push(purchase);
    _purchases = list;

    // Update stock levels
    const inventory = [..._inventory];
    purchase.items.forEach(pItem => {
      const invItem = inventory.find(i => i.id === pItem.productId);
      if (invItem) {
        invItem.quantity += pItem.quantity;
        // purchasePrice removed from schema
      }
    });
    _inventory = inventory;

    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(list));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));

    const results = await Promise.all([
      supabase.from('purchases').upsert(purchase),
      ...purchase.items.map(pItem => {
        const invItem = _inventory.find(i => i.id === pItem.productId);
        return invItem ? supabase.from('inventory').upsert(invItem) : Promise.resolve({ error: null });
      })
    ]);

    const errors = results.filter(r => r.error).map(r => r.error?.message);
    if (errors.length > 0) {
      console.error('Errors saving purchase/inventory to Supabase:', errors);
      throw new Error(errors.join(', '));
    }
  },

  getBranches: (): Branch[] => _branches,
  saveBranch: async (branch: Branch) => {
    const list = [..._branches];
    const index = list.findIndex(b => b.id === branch.id);
    if (index > -1) list[index] = branch;
    else list.push(branch);
    _branches = list;
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(list));

    // Map camelCase properties to lowercase column names for Supabase
    const dbBranch = {
      id: branch.id,
      name: branch.name,
      contactnumber: branch.contactNumber,
      email: branch.email,
      country: branch.country,
      state: branch.state,
      city: branch.city,
      address: branch.address
    };

    const { error } = await supabase.from('branches').upsert(dbBranch);
    if (error) {
      console.error('Error saving branch to Supabase:', error.message);
      throw error;
    }
  },
  deleteBranch: async (id: string) => {
    _branches = _branches.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(_branches));
    const { error } = await supabase.from('branches').delete().eq('id', id);
    if (error) {
      console.error('Error deleting branch from Supabase:', error.message);
      throw error;
    }
  }
};