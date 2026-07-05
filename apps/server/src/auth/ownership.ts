import { ForbiddenException } from "@nestjs/common";
import type { AuthenticatedUser } from "./firebase-auth.guard";

/** FR-012: non-owners may only act on a resource if they are an admin. */
export function assertOwner(user: AuthenticatedUser, resourceOwnerId: string): void {
  if (user.isAdmin) {
    return;
  }
  if (user.uid !== resourceOwnerId) {
    throw new ForbiddenException("You do not own this resource");
  }
}
