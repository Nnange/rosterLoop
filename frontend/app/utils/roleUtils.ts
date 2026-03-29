/**
 * Role checking utility functions
 */

export const isAdmin = (role?: string): boolean => {
  return role === 'ROLE_ADMIN'
}

export const isUser = (role?: string): boolean => {
  return role === 'ROLE_USER'
}

export const canCreateHousehold = (role?: string): boolean => {
  return isAdmin(role)
}

export const getRoleDisplayName = (role?: string): string => {
  if (role === 'ROLE_ADMIN') return 'Admin'
  if (role === 'ROLE_USER') return 'Member'
  return 'Unknown'
}
