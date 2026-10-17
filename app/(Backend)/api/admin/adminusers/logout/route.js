import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Clear the admin authentication session.
  cookieStore.delete("adminSession");

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
