import AuditLog from "../models/AuditLog.js";

/**
 * Helper to write HIPAA-inspired audit logs when resources are accessed or modified.
 */
export async function logAudit(req, action, resource, resourceId = null) {
  try {
    if (!req.user) return; // Only log authenticated actions
    
    await AuditLog.create({
      userId: req.user._id,
      userModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      action,
      resource,
      resourceId,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    // Fail silently in production, log error to console
    console.error("Audit log creation failed:", error);
  }
}
