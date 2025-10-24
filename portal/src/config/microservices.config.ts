/**
 * Microservices Configuration
 *
 * Central configuration for all micro-frontends loaded by the portal.
 * Each microservice is a self-contained Web Component with its own backend.
 */

export interface MicroService {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Short title for navigation */
  title: string;

  /** Material Design Icon name (mdi-*) */
  icon: string;

  /** Route path in portal */
  path: string;

  /** Custom element tag name */
  componentTag: string;

  /** Script URL (production or proxied dev URL) */
  scriptUrl: string;

  /** Dev server port (used for Vite proxy in development) */
  devPort?: number;

  /** Required roles to access (empty = public) */
  requiredRoles?: string[];

  /** Description for dashboard */
  description?: string;

  /** Show in navigation menu */
  showInNav?: boolean;

  /** Show in dashboard */
  showInDashboard?: boolean;
}

/**
 * Registered microservices
 * Add new microservices here as they are developed
 */
export const microservices: MicroService[] = [
  {
    id: 'user-management',
    name: 'User Management',
    title: 'Users',
    icon: 'mdi-account-group',
    path: '/users',
    componentTag: 'user-management-app',
    scriptUrl: import.meta.env.DEV
      ? 'http://localhost:3001/src/main.ts' // Dev: direct Vite dev server
      : '/microservices/user-management/user-management.js', // Prod: built file
    devPort: 3001,
    requiredRoles: [], // No roles required for now
    description: 'Manage users, roles, and permissions',
    showInNav: true,
    showInDashboard: true,
  },
  // Future microservices:
  // {
  //   id: 'product-management',
  //   name: 'Product Management',
  //   title: 'Products',
  //   icon: 'mdi-package-variant',
  //   path: '/products',
  //   componentTag: 'product-management-app',
  //   scriptUrl: '/microservices/product-management/product-management.js',
  //   devPort: 3002,
  //   description: 'Manage products and inventory',
  //   showInNav: true,
  //   showInDashboard: true,
  // },
];

/**
 * Get microservice by ID
 */
export function getMicroServiceById(id: string): MicroService | undefined {
  return microservices.find((ms) => ms.id === id);
}

/**
 * Get microservice by path
 */
export function getMicroServiceByPath(path: string): MicroService | undefined {
  return microservices.find((ms) => ms.path === path);
}

/**
 * Get microservices for navigation menu
 */
export function getNavMicroServices(): MicroService[] {
  return microservices.filter((ms) => ms.showInNav !== false);
}

/**
 * Get microservices for dashboard
 */
export function getDashboardMicroServices(): MicroService[] {
  return microservices.filter((ms) => ms.showInDashboard !== false);
}

/**
 * Check if user has required roles for microservice
 */
export function canAccessMicroService(microservice: MicroService, userRoles: string[] = []): boolean {
  if (!microservice.requiredRoles || microservice.requiredRoles.length === 0) {
    return true; // No roles required, public access
  }

  return microservice.requiredRoles.some((role) => userRoles.includes(role));
}
