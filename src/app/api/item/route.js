import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 10; 
    const skip = (page - 1) * limit;

    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");

        // 2. Use .skip() and .limit() for the "pagination set" requirement
        const result = await db.collection("item")
            .find({})
            .skip(skip)
            .limit(limit)
            .toArray();

        return NextResponse.json(result, {
            headers: corsHeaders
        });
    } catch (exception) {
        return NextResponse.json({ message: exception.toString() }, {
            status: 400,
            headers: corsHeaders
        });
    }
}

export async function POST(req) {
    const data = await req.json();
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        
        const result = await db.collection("item").insertOne({
            itemName: data.name,
            itemCategory: data.category,
            itemPrice: data.price,
            status: "ACTIVE" 
        });

        return NextResponse.json({ id: result.insertedId }, {
            status: 200,
            headers: corsHeaders
        });
    } catch (exception) {
        return NextResponse.json({ message: exception.toString() }, {
            status: 400,
            headers: corsHeaders
        });
    }
}