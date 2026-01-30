import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Headers to prevent caching issues between the React Frontend and Next Backend
const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    ...corsHeaders
};

export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// GET: Fetch a single item with Cache-Control headers
export async function GET(req, { params }) {
    const { id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const result = await db.collection("item").findOne({ _id: new ObjectId(id) });
        
        return NextResponse.json(result, { headers: noCacheHeaders });
    } catch (exception) {
        return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
    }
}

// PATCH: Partially update specific fields
export async function PATCH(req, { params }) {
    const { id } = await params;
    const data = await req.json();
    const partialUpdate = {};

    // Mapping fields according to assignment requirements
    if (data.name != null) partialUpdate.itemName = data.name;
    if (data.category != null) partialUpdate.itemCategory = data.category;
    if (data.price != null) partialUpdate.itemPrice = data.price;
    if (data.status != null) partialUpdate.status = data.status;

    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        
        // Use $set to update only the specific fields provided
        const updatedResult = await db.collection("item").updateOne(
            { _id: new ObjectId(id) },
            { $set: partialUpdate }
        );

        return NextResponse.json(updatedResult, { status: 200, headers: corsHeaders });
    } catch (exception) {
        return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
    }
}

// PUT: Replace/Update entire item
export async function PUT(req, { params }) {
    const { id } = await params;
    const data = await req.json();
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");

        // Remove _id from data to avoid MongoDB immutability errors
        const { _id, ...updateData } = data;

        const updatedResult = await db.collection("item").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        return NextResponse.json(updatedResult, { status: 200, headers: corsHeaders });
    } catch (exception) {
        return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
    }
}

// DELETE: Remove an item permanently
export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        
        const result = await db.collection("item").deleteOne({
            _id: new ObjectId(id)
        });

        return NextResponse.json(result, { status: 200, headers: corsHeaders });
    } catch (exception) {
        return NextResponse.json({ message: exception.toString() }, { status: 400, headers: corsHeaders });
    }
}