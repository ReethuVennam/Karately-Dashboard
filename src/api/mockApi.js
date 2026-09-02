/* ==========================================================================
   MOCK API — async functions shaped like the real Karatly admin API.
   This is a UI-only mock (no backend): every function reads/derives from
   the in-memory arrays in ../data/mockData.js. Ported from apiOverview,
   apiOrdersSummary, apiRecentTransactions, apiUsers, apiUserDetail in
   karatly-admin-dashboard.html (the MOCK_MODE branches only).
   ========================================================================== */

import { MOCK_DAILY_90, MOCK_USERS, getUserDetailExtra, MOCK_TRANSACTIONS } from '../data/mockData';

export async function apiOverview(days) {
  const daily = MOCK_DAILY_90.slice(MOCK_DAILY_90.length - days);
  const sum = (key) => daily.reduce((a, d) => a + (d[key] || 0), 0);
  const kpis = {
    total_users: MOCK_USERS.length * 154,
    kyc_completed: Math.round(MOCK_USERS.filter((u) => u.kyc_status === 'verified').length * 154 * 0.98),
    bank_validated: Math.round(MOCK_USERS.filter((u) => u.bank_verified).length * 154 * 0.95),
    users_with_address: Math.round(MOCK_USERS.filter((u) => u.delivery_addresses > 0).length * 154 * 0.9),
    total_collected: sum('cash_collected'),
    gold_grams: +sum('gold_grams').toFixed(2),
    silver_grams: +sum('silver_grams').toFixed(2),
    diamond_grams: +sum('diamond_grams').toFixed(3),
    gold_value: sum('gold_amount'),
    silver_value: sum('silver_amount'),
    diamond_value: sum('diamond_amount'),
    sell_count: sum('sells'),
    sell_value: sum('sell_amount'),
    redeem_count: sum('redeems'),
    redeem_value: sum('redeem_amount'),
    paid_no_gold: Math.max(1, Math.round(days / 20)),
    gold_no_payment: Math.max(0, Math.round(days / 45)),
    gold_and_payment: sum('transactions') - Math.max(1, Math.round(days / 20)),
  };
  return { kpis, daily };
}

export async function apiOrdersSummary(days) {
  const daily = MOCK_DAILY_90.slice(MOCK_DAILY_90.length - days);
  const sum = (key) => daily.reduce((a, d) => a + (d[key] || 0), 0);
  const buy_count = sum('transactions') - sum('sells') - sum('redeems');
  const total_orders = sum('transactions');
  const order_failed = Math.max(2, Math.round(days / 6));
  const order_pending = Math.max(3, Math.round(days / 5));
  const order_success = total_orders - order_failed - order_pending;
  return {
    buy_count,
    sell_count: sum('sells'),
    redeem_count: sum('redeems'),
    total_orders,
    order_success,
    order_failed,
    order_pending,
    payment_paid: order_success + Math.round(order_pending * 0.4),
    payment_failed: order_failed,
    payment_pending: Math.round(order_pending * 0.6),
    augmont_purchased: order_success,
    diamond_purchased: Math.max(1, Math.round(days / 18)),
    paid_no_gold: Math.max(1, Math.round(days / 20)),
    total_collected: sum('cash_collected'),
  };
}

export async function apiRecentTransactions(days, limit, status) {
  let list = MOCK_TRANSACTIONS;
  if (status && status !== 'ALL') list = list.filter((t) => t.payment_status === status);
  return { transactions: list.slice(0, limit) };
}

export async function apiUsers(search, kyc) {
  let list = MOCK_USERS;
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((u) => u.name.toLowerCase().includes(s) || u.mobile.includes(s) || u.email.toLowerCase().includes(s));
  }
  if (kyc) list = list.filter((u) => u.kyc_status === kyc);
  return { users: list };
}

export async function apiUserDetail(client_id) {
  const profile = MOCK_USERS.find((u) => u.client_id === client_id);
  const extra = getUserDetailExtra(client_id);
  return { profile, orders: extra.orders, banks: extra.banks, addresses: extra.addresses };
}
