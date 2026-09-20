export function canRead(user, doc) { return user.id === doc.ownerId || user.role === "admin"; }
