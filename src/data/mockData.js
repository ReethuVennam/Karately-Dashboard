/* ==========================================================================
   MOCK DATA — shaped exactly like the API responses in the spec.
   Ported from karatly-admin-dashboard.html (MOCK_MODE = true block).
   ========================================================================== */

export const MOCK_ADMIN_ACCOUNTS = [
  { id: 1, phoneNumber: '9999999999', password: 'admin@123', fullName: 'Super Admin', email: 'admin@karatly.net', isSuperAdmin: true, createdAt: '2026-01-04' },
  { id: 2, phoneNumber: '9876543210', password: 'ops@2026', fullName: 'Priya Suresh', email: 'priya@karatly.net', isSuperAdmin: false, createdAt: '2026-03-11' },
  { id: 3, phoneNumber: '9123456780', password: 'ops@2026', fullName: 'Arjun Menon', email: 'arjun@karatly.net', isSuperAdmin: false, createdAt: '2026-05-20' },
];

export function seedDaily(days) {
  const out = [];
  const today = new Date('2026-08-31');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const seed = (d.getDate() * 7 + d.getMonth() * 3) % 11;
    out.push({
      date: d.toISOString().slice(0, 10),
      new_registrations: 6 + (seed % 9),
      bank_validations: 4 + (seed % 6),
      sells: 1 + (seed % 4),
      sell_amount: (1 + (seed % 4)) * 4200,
      redeems: seed % 3,
      redeem_amount: (seed % 3) * 5200,
      gold_grams: +(1.1 + (seed % 5) * 0.4).toFixed(2),
      gold_amount: Math.round((1.1 + (seed % 5) * 0.4) * 6700),
      silver_grams: +(0.2 + (seed % 4) * 0.3).toFixed(2),
      silver_amount: Math.round((0.2 + (seed % 4) * 0.3) * 88),
      diamond_grams: +(0.02 + (seed % 3) * 0.015).toFixed(3),
      diamond_amount: Math.round((0.02 + (seed % 3) * 0.015) * 310000),
      cash_collected: 18000 + seed * 3100,
      transactions: 8 + (seed % 10),
    });
  }
  return out;
}
export const MOCK_DAILY_90 = seedDaily(90);

export const MOCK_USERS = [
  { client_id: 'u-1001', name: 'Sai Kiran', mobile: '9963710150', email: 'sai.kiran@gmail.com', kyc_status: 'verified', pan_verified: 1, aadhaar_verified: 1, bank_verified: 1, registered_at: '2026-08-24 10:00:00', bank_accounts: 2, primary_account: '****1234', delivery_addresses: 1, primary_address: 'Flat 302, Lakeview Residency, Gachibowli, Hyderabad, Telangana - 500032', buy_count: 3, buy_amount: 45000, gold_grams: 2.4, silver_grams: 0.0, diamond_grams: 0.0, sell_count: 1, sell_amount: 12000, redeem_count: 0, redeem_amount: 0, last_activity: '2026-08-25 13:07:56', date_of_birth: '1994-02-11', city: 'Hyderabad', state: 'Telangana', pan_number: 'ABCDE1234F', pan_name: 'SAI KIRAN', augmont_unique_id: 'AUG-88213', pincode: '500032', kyc_completed_at: '2026-08-24 11:20:00' },
  { client_id: 'u-1002', name: 'Meera Nair', mobile: '9845123098', email: 'meera.nair@yahoo.com', kyc_status: 'pending', pan_verified: 1, aadhaar_verified: 0, bank_verified: 0, registered_at: '2026-08-20 09:14:20', bank_accounts: 0, primary_account: '—', delivery_addresses: 0, primary_address: null, buy_count: 1, buy_amount: 5000, gold_grams: 0.7, silver_grams: 0.0, diamond_grams: 0.0, sell_count: 0, sell_amount: 0, redeem_count: 0, redeem_amount: 0, last_activity: '2026-08-21 18:44:03', date_of_birth: '1998-07-02', city: 'Kochi', state: 'Kerala', pan_number: 'BKPQR9087L', pan_name: 'MEERA NAIR', augmont_unique_id: 'AUG-77410', pincode: '682001', kyc_completed_at: null },
  { client_id: 'u-1003', name: 'Ravi Teja', mobile: '9000112233', email: 'ravi.teja@outlook.com', kyc_status: 'verified', pan_verified: 1, aadhaar_verified: 1, bank_verified: 1, registered_at: '2026-07-02 16:30:00', bank_accounts: 1, primary_account: '****5567', delivery_addresses: 2, primary_address: '12-4-88, MG Road, Vijayawada, Andhra Pradesh - 520010', buy_count: 9, buy_amount: 132000, gold_grams: 9.8, silver_grams: 4.1, diamond_grams: 0.12, sell_count: 3, sell_amount: 38000, redeem_count: 1, redeem_amount: 15000, last_activity: '2026-08-30 08:12:41', date_of_birth: '1990-11-28', city: 'Vijayawada', state: 'Andhra Pradesh', pan_number: 'CMTGH4521Z', pan_name: 'RAVI TEJA', augmont_unique_id: 'AUG-55021', pincode: '520010', kyc_completed_at: '2026-07-03 09:10:00' },
  { client_id: 'u-1004', name: 'Anjali Reddy', mobile: '9550098712', email: 'anjali.reddy@gmail.com', kyc_status: 'rejected', pan_verified: 1, aadhaar_verified: 0, bank_verified: 0, registered_at: '2026-08-11 11:02:55', bank_accounts: 0, primary_account: '—', delivery_addresses: 0, primary_address: null, buy_count: 0, buy_amount: 0, gold_grams: 0, silver_grams: 0, diamond_grams: 0.0, sell_count: 0, sell_amount: 0, redeem_count: 0, redeem_amount: 0, last_activity: '2026-08-12 09:00:00', date_of_birth: '2001-04-19', city: 'Warangal', state: 'Telangana', pan_number: 'DPLNM7788Q', pan_name: 'ANJALI REDDY', augmont_unique_id: 'AUG-91002', pincode: '506002', kyc_completed_at: null },
  { client_id: 'u-1005', name: 'Karthik Iyer', mobile: '9812340098', email: 'karthik.iyer@gmail.com', kyc_status: 'incomplete', pan_verified: 0, aadhaar_verified: 0, bank_verified: 0, registered_at: '2026-08-29 07:40:12', bank_accounts: 0, primary_account: '—', delivery_addresses: 0, primary_address: null, buy_count: 0, buy_amount: 0, gold_grams: 0, silver_grams: 0, diamond_grams: 0.0, sell_count: 0, sell_amount: 0, redeem_count: 0, redeem_amount: 0, last_activity: '2026-08-29 07:41:00', date_of_birth: '1996-09-05', city: 'Chennai', state: 'Tamil Nadu', pan_number: '—', pan_name: '—', augmont_unique_id: '—', pincode: '600001', kyc_completed_at: null },
  { client_id: 'u-1006', name: 'Divya Sharma', mobile: '9711223344', email: 'divya.sharma@gmail.com', kyc_status: 'verified', pan_verified: 1, aadhaar_verified: 1, bank_verified: 1, registered_at: '2026-05-15 14:22:10', bank_accounts: 1, primary_account: '****7842', delivery_addresses: 1, primary_address: 'B-14, Vasant Vihar, New Delhi, Delhi - 110057', buy_count: 14, buy_amount: 210500, gold_grams: 16.2, silver_grams: 2.4, diamond_grams: 0.35, sell_count: 5, sell_amount: 61000, redeem_count: 2, redeem_amount: 29000, last_activity: '2026-08-30 20:03:11', date_of_birth: '1988-01-30', city: 'Delhi', state: 'Delhi', pan_number: 'EWQXC1029R', pan_name: 'DIVYA SHARMA', augmont_unique_id: 'AUG-40881', pincode: '110057', kyc_completed_at: '2026-05-16 08:00:00' },
  { client_id: 'u-1007', name: 'Faisal Ahmed', mobile: '9988776655', email: 'faisal.ahmed@gmail.com', kyc_status: 'verified', pan_verified: 1, aadhaar_verified: 1, bank_verified: 0, registered_at: '2026-06-22 12:00:00', bank_accounts: 0, primary_account: '—', delivery_addresses: 1, primary_address: '4th Cross, Indiranagar, Bengaluru, Karnataka - 560038', buy_count: 2, buy_amount: 8000, gold_grams: 1.1, silver_grams: 0.0, diamond_grams: 0.0, sell_count: 0, sell_amount: 0, redeem_count: 0, redeem_amount: 0, last_activity: '2026-08-18 10:20:00', date_of_birth: '1993-12-14', city: 'Bengaluru', state: 'Karnataka', pan_number: 'FTYAB3345V', pan_name: 'FAISAL AHMED', augmont_unique_id: 'AUG-63321', pincode: '560038', kyc_completed_at: '2026-06-23 14:12:00' },
  { client_id: 'u-1008', name: 'Sneha Kulkarni', mobile: '9022334455', email: 'sneha.k@gmail.com', kyc_status: 'pending', pan_verified: 0, aadhaar_verified: 1, bank_verified: 0, registered_at: '2026-08-27 17:11:00', bank_accounts: 0, primary_account: '—', delivery_addresses: 0, primary_address: null, buy_count: 0, buy_amount: 0, gold_grams: 0, silver_grams: 0, diamond_grams: 0.0, sell_count: 0, sell_amount: 0, redeem_count: 0, redeem_amount: 0, last_activity: '2026-08-27 17:12:00', date_of_birth: '1999-03-22', city: 'Pune', state: 'Maharashtra', pan_number: '—', pan_name: '—', augmont_unique_id: '—', pincode: '411001', kyc_completed_at: null },
];

export const MOCK_USER_DETAIL_EXTRA = {
  'u-1001': {
    orders: [
      { order_id: 'o-1', order_reference: 'KTL-88041', merchant_transaction_id: 'KTL-88041-MT', order_type: 'digital_purchase', order_status: 'completed', augmont_txn_id: 'AGX-9910', amount: 20000, subtotal_amount: 19400, tax_amount: 600, metal_type: 'gold', quantity: 1.4, tracking_number: null, shipping_address: null, order_date: '2026-08-10 11:20:00' },
      { order_id: 'o-2', order_reference: 'KTL-88090', merchant_transaction_id: 'KTL-88090-MT', order_type: 'digital_purchase', order_status: 'completed', augmont_txn_id: 'AGX-9944', amount: 25000, subtotal_amount: 24300, tax_amount: 700, metal_type: 'gold', quantity: 1.0, tracking_number: null, shipping_address: null, order_date: '2026-08-20 09:05:00' },
      { order_id: 'o-3', order_reference: 'KTL-88190', merchant_transaction_id: 'KTL-88190-MT', order_type: 'digital_sell', order_status: 'completed', augmont_txn_id: 'AGX-9990', amount: 12000, subtotal_amount: 12000, tax_amount: 0, metal_type: 'gold', quantity: 0.9, tracking_number: null, shipping_address: null, order_date: '2026-08-25 13:07:56' },
    ],
    banks: [
      { bank_account_id: 'ba-1', provider_bank_id: 'HDFC-1234', account_holder_name: 'Sai Kiran', account_number: '****1234', ifsc_code: 'HDFC0001234', status: 'active', is_primary: 1, provider: 'AUGMONT', created_at: '2026-08-24 10:05:00' },
      { bank_account_id: 'ba-2', provider_bank_id: 'ICIC-9087', account_holder_name: 'Sai Kiran', account_number: '****9087', ifsc_code: 'ICIC0004521', status: 'active', is_primary: 0, provider: 'AUGMONT', created_at: '2026-08-26 12:00:00' },
    ],
    addresses: [
      { address_id: 'ad-1', name: 'Sai Kiran', mobile_number: '9963710150', email: 'sai.kiran@gmail.com', address_line: 'Flat 302, Lakeview Residency, Gachibowli', city: 'Hyderabad', state: 'Telangana', pincode: '500032', country: 'India', address_source: 'AADHAAR', is_primary: 1, created_at: '2026-08-24 10:10:00' },
    ],
  },
  'u-1003': {
    orders: [
      { order_id: 'o-4', order_reference: 'KTL-87710', merchant_transaction_id: 'KTL-87710-MT', order_type: 'digital_purchase', order_status: 'completed', augmont_txn_id: 'AGX-8801', amount: 37200, subtotal_amount: 36000, tax_amount: 1200, metal_type: 'diamond', quantity: 0.12, tracking_number: null, shipping_address: null, order_date: '2026-08-15 10:45:00' },
      { order_id: 'o-5', order_reference: 'KTL-87990', merchant_transaction_id: 'KTL-87990-MT', order_type: 'digital_purchase', order_status: 'completed', augmont_txn_id: 'AGX-8850', amount: 60000, subtotal_amount: 58200, tax_amount: 1800, metal_type: 'gold', quantity: 8.9, tracking_number: null, shipping_address: null, order_date: '2026-08-22 08:30:00' },
      { order_id: 'o-6', order_reference: 'KTL-87610', merchant_transaction_id: 'KTL-87610-MT', order_type: 'physical_redemption', order_status: 'completed', augmont_txn_id: 'AGX-8790', amount: 15000, subtotal_amount: 15000, tax_amount: 0, metal_type: 'gold', quantity: 2.0, tracking_number: 'IND9988771122', shipping_address: '12-4-88, MG Road, Vijayawada, Andhra Pradesh - 520010', order_date: '2026-08-05 09:30:00' },
    ],
    banks: [
      { bank_account_id: 'ba-3', provider_bank_id: 'SBI-5567', account_holder_name: 'Ravi Teja', account_number: '****5567', ifsc_code: 'SBIN0005567', status: 'active', is_primary: 1, provider: 'AUGMONT', created_at: '2026-07-02 16:45:00' },
    ],
    addresses: [
      { address_id: 'ad-2', name: 'Ravi Teja', mobile_number: '9000112233', email: 'ravi.teja@outlook.com', address_line: '12-4-88, MG Road', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520010', country: 'India', address_source: 'MANUAL', is_primary: 1, created_at: '2026-07-02 16:40:00' },
      { address_id: 'ad-3', name: 'Ravi Teja', mobile_number: '9000112233', email: 'ravi.teja@outlook.com', address_line: 'Plot 9, Kanuru', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520007', country: 'India', address_source: 'AADHAAR', is_primary: 0, created_at: '2026-07-15 11:00:00' },
    ],
  },
};

export function getUserDetailExtra(client_id) {
  return MOCK_USER_DETAIL_EXTRA[client_id] || { orders: [], banks: [], addresses: [] };
}

export const MOCK_TRANSACTIONS = [
  { order_id: '9a6a242a-1', order_reference: 'KARATLY-CF-2026082513075119b514', merchant_transaction_id: 'KARATLY-CF-2026082513075119b514', order_type: 'digital_purchase', order_status: 'completed', augmont_txn_id: 'F48692178755714309101259403', client_name: 'Sai Kiran', client_mobile: '9963710150', metal_type: 'gold', amount: 10000, payment_status: 'SUCCESS', payment_gateway: 'CASHFREE', payment_id: '6317096865', rrn: '623782166230', augmont_quantity: 0.6, gold_balance_after: '2.4000', silver_balance_after: '0.0000', augmont_invoice: 'INV-88041', tax_amount: '300.00', augmont_message: 'Successfully bought 0.6 grams of gold @ 6740.28', augmont_error: null, order_date: '2026-08-25 13:07:56' },
  { order_id: '9a6a242a-2', order_reference: 'KARATLY-CF-2026083008124188aa02', merchant_transaction_id: 'KARATLY-CF-2026083008124188aa02', order_type: 'digital_sell', order_status: 'completed', augmont_txn_id: 'F48692178755714309101259512', client_name: 'Ravi Teja', client_mobile: '9000112233', metal_type: 'gold', amount: 38000, payment_status: 'SUCCESS', payment_gateway: 'CASHFREE', payment_id: '6317096912', rrn: '623782166344', augmont_quantity: 5.6, gold_balance_after: '4.2000', silver_balance_after: '4.1000', augmont_invoice: 'INV-87990', tax_amount: '0.00', augmont_message: 'Successfully sold 5.6 grams of gold @ 6785.71', augmont_error: null, order_date: '2026-08-30 08:12:41' },
  { order_id: '9a6a242a-3', order_reference: 'KARATLY-EB-2026082916300077f091', merchant_transaction_id: 'KARATLY-EB-2026082916300077f091', order_type: 'digital_purchase', order_status: 'failed', augmont_txn_id: '', client_name: 'Karthik Iyer', client_mobile: '9812340098', metal_type: 'gold', amount: 6000, payment_status: 'FAILED', payment_gateway: 'EASEBUZZ', payment_id: '6317096944', rrn: null, augmont_quantity: 0, gold_balance_after: null, silver_balance_after: null, augmont_invoice: null, tax_amount: '0.00', augmont_message: null, augmont_error: 'Payment gateway declined the transaction (insufficient funds)', order_date: '2026-08-29 16:30:00' },
  { order_id: '9a6a242a-4', order_reference: 'KARATLY-CF-2026082210450012ab77', merchant_transaction_id: 'KARATLY-CF-2026082210450012ab77', order_type: 'digital_purchase', order_status: 'completed', augmont_txn_id: 'F48692178755714309101260011', client_name: 'Ravi Teja', client_mobile: '9000112233', metal_type: 'diamond', amount: 37200, payment_status: 'SUCCESS', payment_gateway: 'CASHFREE', payment_id: '6317097001', rrn: '623782166501', augmont_quantity: 0.12, gold_balance_after: '8.9000', silver_balance_after: '4.1000', augmont_invoice: 'INV-87710', tax_amount: '1200.00', augmont_message: 'Successfully bought 0.12 grams of diamond @ 310000.00', augmont_error: null, order_date: '2026-08-15 10:45:00' },
  { order_id: '9a6a242a-5', order_reference: 'KARATLY-CF-2026083020031198cd44', merchant_transaction_id: 'KARATLY-CF-2026083020031198cd44', order_type: 'digital_purchase', order_status: 'pending', augmont_txn_id: '', client_name: 'Divya Sharma', client_mobile: '9711223344', metal_type: 'silver', amount: 9000, payment_status: 'PENDING', payment_gateway: 'CASHFREE', payment_id: '6317097055', rrn: null, augmont_quantity: 0, gold_balance_after: null, silver_balance_after: null, augmont_invoice: null, tax_amount: '0.00', augmont_message: null, augmont_error: null, order_date: '2026-08-30 20:03:11' },
  { order_id: '9a6a242a-6', order_reference: 'KARATLY-EB-2026082718440033ef19', merchant_transaction_id: 'KARATLY-EB-2026082718440033ef19', order_type: 'physical_redemption', order_status: 'completed', augmont_txn_id: 'F48692178755714309101260255', client_name: 'Divya Sharma', client_mobile: '9711223344', metal_type: 'gold', amount: 29000, payment_status: 'SUCCESS', payment_gateway: 'EASEBUZZ', payment_id: '6317097102', rrn: '623782166670', augmont_quantity: 2.0, gold_balance_after: '14.2000', silver_balance_after: '2.4000', augmont_invoice: 'INV-87200', tax_amount: '0.00', augmont_message: 'Redemption dispatched for 2.0 grams of gold', augmont_error: null, order_date: '2026-08-28 09:15:00' },
  { order_id: '9a6a242a-7', order_reference: 'KARATLY-CF-2026081810200087bb31', merchant_transaction_id: 'KARATLY-CF-2026081810200087bb31', order_type: 'digital_purchase', order_status: 'completed', augmont_txn_id: '', client_name: 'Faisal Ahmed', client_mobile: '9988776655', metal_type: 'gold', amount: 8000, payment_status: 'SUCCESS', payment_gateway: 'CASHFREE', payment_id: '6317097166', rrn: '623782166781', augmont_quantity: 0, gold_balance_after: null, silver_balance_after: null, augmont_invoice: null, tax_amount: '240.00', augmont_message: null, augmont_error: 'Augmont allocation timed out — payment captured but gold not yet credited', order_date: '2026-08-18 10:20:00' },
  { order_id: '9a6a242a-8', order_reference: 'KARATLY-CF-2026082709110044cc02', merchant_transaction_id: 'KARATLY-CF-2026082709110044cc02', order_type: 'digital_purchase', order_status: 'failed', augmont_txn_id: '', client_name: 'Sneha Kulkarni', client_mobile: '9022334455', metal_type: 'silver', amount: 3000, payment_status: 'FAILED', payment_gateway: 'CASHFREE', payment_id: '6317097210', rrn: null, augmont_quantity: 0, gold_balance_after: null, silver_balance_after: null, augmont_invoice: null, tax_amount: '0.00', augmont_message: null, augmont_error: 'Card declined by issuing bank', order_date: '2026-08-27 09:11:00' },
];

export const ORDER_TYPE_LABEL = { digital_purchase: 'Buy', digital_sell: 'Sell', physical_redemption: 'Redeem' };
