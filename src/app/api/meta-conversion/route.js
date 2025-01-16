import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
    const pixelId = process.env.FACEBOOK_PIXEL_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`;
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


    try {
        const { eventName, userData, customData, eventSourceUrl } = await request.json();

        if (!pixelId) {
            return NextResponse.json({ message: "Pixel ID is required" }, { status: 400 });
        }
        if (!accessToken) {
            return NextResponse.json({ message: "Access token is required" }, { status: 400 });
        }
        if (!eventName) {
            return NextResponse.json({ message: "Event name is required" }, { status: 400 });
        }

        const hashData = (value) =>
            value ? crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex") : null;

        const hashedUserData = {
            em: hashData(userData?.em),
            ph: hashData(userData?.pn),
            fn: hashData(userData?.fn),
            ln: hashData(userData?.ln),
            ct: hashData(userData?.ct),
            st: hashData(userData?.st),
            zp: hashData(userData?.zp),
            external_id: hashData(userData?.external_id),
            country: hashData(userData?.country),
            client_ip_address: userData?.client_ip_address,
            client_user_agent: userData?.client_user_agent,
            fbc: userData?.fbc,
            fbp: userData?.fbp,
        };

        // Prepare payload
        const payload = JSON.stringify({
            data: [
                {
                    event_name: eventName,
                    event_id: eventId,
                    event_time: Math.floor(Date.now() / 1000),
                    user_data: hashedUserData,
                    custom_data: customData,
                    event_source_url: eventSourceUrl,
                    action_source: "website",
                },
            ],
            test_event_code: "TEST41644"
        });

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: payload,
        });
        // if (response.ok) {
        //     return NextResponse.json({ success: true, data: payload });
        // }

        if (response.ok) {
            return NextResponse.json({ success: true, sentPayload: JSON.parse(payload), response: await response.json() });
        }
        
        const errorDetails = await response.text();
        throw new Error(`Meta API error: ${errorDetails}`);
        
    } catch (error) {
        console.error("Error in POST /api/meta-conversion:", error.message);
        return NextResponse.json(
            { message: "An error occurred while sending the event to Meta", error: error.message },
            { status: 500 }
        );
    }
}
