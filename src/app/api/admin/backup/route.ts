// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import fs from "fs";
// import path from "path";

// function isAdmin(session: any) {
//   return String(session?.user?.role || "").toLowerCase() === "admin";
// }

// const backupDir = path.join(process.cwd(), "backups");

// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user || !isAdmin(session)) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 403 }
//     );
//   }

//   if (!fs.existsSync(backupDir)) {
//     fs.mkdirSync(backupDir, { recursive: true });
//   }

//   const backups = fs.readdirSync(backupDir);

//   return NextResponse.json({
//     success: true,
//     backups,
//   });
// }

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user || !isAdmin(session)) {
//     return NextResponse.json(
//       { success: false, message: "Unauthorized" },
//       { status: 403 }
//     );
//   }

//   if (!fs.existsSync(backupDir)) {
//     fs.mkdirSync(backupDir, { recursive: true });
//   }

//   // Placeholder backup file.
//   // Replace with real database export logic for production.
//   const filename = `backup-${Date.now()}.json`;

//   fs.writeFileSync(
//     path.join(backupDir, filename),
//     JSON.stringify({
//       createdAt: new Date().toISOString(),
//       note: "Replace with actual MongoDB backup implementation.",
//     })
//   );

//   return NextResponse.json({
//     success: true,
//     message: "Backup created successfully.",
//     filename,
//   });
// }



import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

// Replace these with your actual model paths
import User from "@/models/User";
import Transaction from "@/models/transaction";
import AdminSettings from "@/models/AdminSettings";

function isAdmin(session: any) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !isAdmin(session)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    backups: [
      {
        id: "latest",
        name: "Live JSON Export",
        description:
          "Creates a fresh backup from the current database when requested.",
      },
    ],
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !isAdmin(session)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  await connectToDatabase();

  const [users, transactions, adminSettings] = await Promise.all([
    User.find({}).lean(),
    Transaction.find({}).lean(),
    AdminSettings.findOne({}).lean(),
  ]);

  const backup = {
    metadata: {
      app: "VTU Platform",
      exportedAt: new Date().toISOString(),
      version: 1,
    },
    data: {
      users,
      transactions,
      adminSettings,
    },
  };

  const json = JSON.stringify(backup, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="vtu-backup-${Date.now()}.json"`,
    },
  });
}