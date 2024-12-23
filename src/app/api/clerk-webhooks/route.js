import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(req) {
  const WEBHOOK_SECRET =
    process.env.CLERK_WEBHOOK_SECRET;

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get(
    "svix-timestamp"
  );
  const svix_signature = headerPayload.get(
    "svix-signature"
  );

  if (
    !svix_id ||
    !svix_timestamp ||
    !svix_signature
  ) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    switch (evt.type) {
      case "user.created":
        // Implement user creation logic
        break;
      case "user.updated":
        // Implement user update logic
        break;
      // Add more cases as needed
      default:
      // Handle or log unprocessed event types
    }

    return NextResponse.json(
      {
        message: "Webhook processed successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "Error verifying webhook:",
      err
    );
    return NextResponse.json(
      { error: "Invalid webhook" },
      { status: 400 }
    );
  }
}
