export function hasRole(auth, expectedRole) {
  return Boolean(auth && auth.role === expectedRole);
}
