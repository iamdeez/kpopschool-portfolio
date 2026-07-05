import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ROLES_KEY, Role } from "./roles.decorator";

/**
 * Runs after FirebaseAuthGuard, so request.user is always populated here.
 * Endpoints without @Roles(...) only require authentication, not a specific role.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (requiredRoles.includes("admin") && !user?.isAdmin) {
      throw new ForbiddenException("Admin role required");
    }

    return true;
  }
}
