import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
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

        // Fetch users excluding password field for security
        const result = await db.collection("user")
            .find({}, { projection: { password: 0 } })
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
    const username = data.username;
    const email = data.email;
    const password = data.password;
    const firstname = data.firstname;
    const lastname = data.lastname;
    if (!username || !email || !password) {
        return NextResponse.json({
            message: "Missing mandatory data"
        }, {
            status: 400,
            headers: corsHeaders
        })
    }
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const result = await db.collection("user").insertOne({
            username: username,
            email: email,
            password: await bcrypt.hash(password, 10),
            firstname: firstname,
            lastname: lastname,
            status: "ACTIVE"
        });
        console.log("result", result);
        return NextResponse.json({
            id: result.insertedId
        }, {
            status: 200,
            headers: corsHeaders
        });
    }
    catch (exception) {
        console.log("exception", exception.toString());
        const errorMsg = exception.toString();
        let displayErrorMsg = "";
        if (errorMsg.includes("duplicate")) {
            if (errorMsg.includes("username")) {
                displayErrorMsg = "Duplicate Username!!"
            }
            else if (errorMsg.includes("email")) {
                displayErrorMsg = "Duplicate Email!!"
            }
        }
        return NextResponse.json({
            message: displayErrorMsg
        }, {
            status: 400,
            headers: corsHeaders
        })
    }
}