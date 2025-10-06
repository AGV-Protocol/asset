import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        authed: false,
        email: null,
        isAdmin: false,
        isSuperAdmin: false,
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const email = decodedToken.email;
      
      // For now, we'll use a simple email-based admin check
      // In production, you might want to store admin roles in a database
      const adminEmails = [
        "admin@agvprotocol.com",
        "superadmin@agvprotocol.com",
        // Add more admin emails as needed
      ];
      
      const isAdmin = adminEmails.includes(email || "");
      const isSuperAdmin = email === "superadmin@agvprotocol.com";
      
      return NextResponse.json({
        authed: true,
        email: email,
        isAdmin: isAdmin,
        isSuperAdmin: isSuperAdmin,
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json({
        authed: false,
        email: null,
        isAdmin: false,
        isSuperAdmin: false,
      });
    }
  } catch (error) {
    console.error("Error in whoami route:", error);
    return NextResponse.json({
      authed: false,
      email: null,
      isAdmin: false,
      isSuperAdmin: false,
    });
  }
}