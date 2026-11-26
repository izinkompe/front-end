export const queryKeys = {
  favorites: ['favorites'] as const,
  favoriteLists: ['favorites', 'lists'] as const,
  auth: {
    me: ['auth', 'me'] as const,
  },
  profile: {
    detail: ['profile'] as const,
    addresses: ['profile', 'addresses'] as const,
  },
  offers: {
    all: ['offers'] as const,
    lists: () => [...queryKeys.offers.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.offers.lists(), params] as const,
    details: () => [...queryKeys.offers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.offers.details(), id] as const,
    expiringSoon: () => [...queryKeys.offers.all, 'expiring-soon'] as const,
    farmerOffers: (params?: Record<string, unknown>) =>
      [...queryKeys.offers.all, 'farmer', params] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.orders.lists(), params] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string, userId?: string) => [...queryKeys.orders.details(), id, userId] as const,
  },
  complaints: {
    all: ['complaints'] as const,
    list: (userId?: string, orderId?: string) => ['complaints', userId, orderId] as const,
  },
  payments: {
    detail: (orderId: string, userId?: string) => ['payments', orderId, userId] as const,
    adminQueue: (params?: Record<string, unknown>) => ['payments', 'admin-queue', params] as const,
  },
  verifications: {
    farmerStatus: ['verifications', 'farmer-status'] as const,
    adminQueue: (params?: Record<string, unknown>) =>
      ['verifications', 'admin-queue', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (userId?: string) => [...queryKeys.notifications.all, 'list', userId] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
  needsBoard: {
    all: ['needs-board'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.needsBoard.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.needsBoard.all, 'detail', id] as const,
  },
  farmers: {
    all: ['farmers'] as const,
    detail: (farmerId: string, userId?: string) =>
      [...queryKeys.farmers.all, 'detail', farmerId, userId] as const,
    reviews: (farmerId: string) => [...queryKeys.farmers.all, 'reviews', farmerId] as const,
  },
  admin: {
    complaints: (params?: Record<string, unknown>) => ['admin', 'complaints', params] as const,
    disputes: (params?: Record<string, unknown>) => ['admin', 'disputes', params] as const,
    stats: (params?: Record<string, unknown>) => ['admin', 'stats', params] as const,
    carbonFactors: ['admin', 'carbon-factors'] as const,
  },
}
