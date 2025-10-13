import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { isAdminClaim, isAuthorizedAdminEmail, isSuperAdminEmail } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        authed: false,
        email: null,
        isAdmin: false,
        isSuperAdmin: false,
        claims: { role: null, roles: [], admin: false }
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const email = decodedToken.email;
      
      // Check if user is authorized admin using the new system
      const isAuthorized = await isAuthorizedAdminEmail(email);
      const isSuperAdmin = isSuperAdminEmail(email);
      const isAdmin = isAuthorized || isSuperAdmin || isAdminClaim(decodedToken);
      
      return NextResponse.json({
        authed: true,
        email: email,
        isAdmin: isAdmin,
        isSuperAdmin: isSuperAdmin,
        claims: {
          role: decodedToken.role || null,
          roles: decodedToken.roles || [],
          admin: decodedToken.admin || false
        }
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json({
        authed: false,
        email: null,
        isAdmin: false,
        isSuperAdmin: false,
        claims: { role: null, roles: [], admin: false }
      });
    }
  } catch (error) {
    console.error("Error in whoami route:", error);
    return NextResponse.json({
      authed: false,
      email: null,
      isAdmin: false,
      isSuperAdmin: false,
      claims: { role: null, roles: [], admin: false }
    });
  }
}