import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export async function getAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get("adminSession")?.value;

  if (!token) return null;

  try {
    const parts = token.split(".");

    if (parts.length !== 2) return null;

    const [payload, signature] = parts;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest();

    const actualSignature = Buffer.from(signature, "base64url");

    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );

    if (
      !session.uid ||
      !session.email ||
      !session.exp ||
      session.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      uid: session.uid,
      email: session.email,
    };
  } catch {
    return null;
  }
}
