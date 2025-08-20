import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(request, { params }) {
    try{
        const { id } = params;
        const client = await clientPromise;
        const db = client.db("address");
        const governorate = await db.collection("governorate").findOne({ _id: new ObjectId(id) });
        if(!governorate){
            return NextResponse.json({ message: "المحافظة غير موجودة" }, { status: 404 });
        }
        const shippingPrices=await Promise.all(governorate.shippingPrices.map(async shippingPrice=>{
            const shippingType=await db.collection("shippingType").findOne({ _id: new ObjectId(shippingPrice.shippingTypeId) });
            return {
                shippingTypeId: shippingPrice.shippingTypeId,
                shippingType: shippingType.name,
                description: shippingType.description,
                price: shippingPrice.price
            }
        }))
        governorate.shippingPrices=shippingPrices;
        return NextResponse.json(governorate);
    }catch(error){
        return NextResponse.json({ message: "حدث خطأ أثناء جلب المحافظة" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params; 
        const updateData = await request.json(); 
        const client = await clientPromise;
        const db = client.db("address");

        const governorate = await db.collection("governorate").findOne({ _id: new ObjectId(id) });
        if (!governorate) {
            return NextResponse.json({ message: "المحافظة غير موجودة" }, { status: 404 });
        }

        if (updateData.shippingPrices) {
            await Promise.all(updateData.shippingPrices.map(async (priceUpdate) => {
                await db.collection("governorate").updateOne(
                    {
                        _id: new ObjectId(id),
                        "shippingPrices.shippingTypeId": priceUpdate.shippingTypeId,
                    },
                    {
                        $set: { "shippingPrices.$.price": priceUpdate.price },
                    }
                );
            }));
        }

        const { shippingPrices, ...otherUpdates } = updateData; 
        if (Object.keys(otherUpdates).length > 0) {
            await db.collection("governorate").updateOne(
                { _id: new ObjectId(id) },
                { $set: otherUpdates }
            );
        }

        return NextResponse.json({ message: "تم تحديث المحافظة بنجاح" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "حدث خطأ أثناء تحديث المحافظة" }, { status: 500 });
    }
}


export async function DELETE(request, { params }) {
    try{
        const { id } = params;
        const client = await clientPromise;
        const db = client.db("address");
        const governorate = await db.collection("governorate").deleteOne({ _id: new ObjectId(id) });
        if(!governorate){
            return NextResponse.json({ message: "المحافظة غير موجودة" }, { status: 404 });
        }
        return NextResponse.json({message:"تم حذف المحافظة بنجاح"});
    }catch(error){
        return NextResponse.json({ message: "حدث خطأ أثناء حذف المحافظة" }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const { id } = params; 
        const { shippingTypeId, price } = await request.json(); 
        const client = await clientPromise;
        const db = client.db("address");

        const shippingType = await db.collection("shippingType").findOne({ _id: new ObjectId(shippingTypeId) });
        if (!shippingType) {
            return NextResponse.json({ message: "نوع الشحنة غير موجود" }, { status: 404 });
        }

        const governorateUpdate = await db.collection("governorate").updateOne(
            {
                _id: new ObjectId(id),
                "shippingPrices.shippingTypeId": { $ne: shippingTypeId }, 
            },
            {
                $push: { shippingPrices: { shippingTypeId, price } },
            }
        );

        if (governorateUpdate.matchedCount === 0) {
            return NextResponse.json({ message: "نوع الشحنة بالفعل موجود في المحافظة" }, { status: 400 });
        }

        const governorate = await db.collection("governorate").findOne({ _id: new ObjectId(id) });

        return NextResponse.json(governorate);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "حدث خطأ أثناء إضافة نوع الشحنة" }, { status: 500 });
    }
}