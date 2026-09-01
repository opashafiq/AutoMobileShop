// The root route (default page after login — see AuthLogin's router.push('/'))
// shows the Sales & Inventory Analytics dashboard. Content is re-exported from
// the sales-analytics page so both URLs stay a single source of truth.
export { default, metadata } from './dashboards/sales-analytics/page'
