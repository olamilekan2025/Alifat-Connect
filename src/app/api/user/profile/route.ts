// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";

// import { authOptions } from "@/lib/auth";
// import { connectToDatabase } from "@/lib/mongodb";
// import User from "@/models/User";

// export async function GET() {
//   try {
//     await connectToDatabase();

//     const session =
//       await getServerSession(authOptions);

//     if (!session?.user?.email) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     const user = await User.findOne({
//       email: session.user.email,
//     }).lean();

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }



//     return NextResponse.json({
//       success: true,
//       user: {
//         walletBalance:
//           user.walletBalance || 0,
//         accountType:
//           user.accountType || "user",
//         sellerSince:
//           user.sellerSince || null,
//       },
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Failed to load profile",
//       },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    }).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,

        name: user.name || "",

        firstname:
          user.firstname || "",

        lastname:
          user.lastname || "",

        email: user.email || "",

phone: (() => {
  const phone = user.phone || "";

  if (phone.startsWith("+234")) {
    return `0${phone.slice(4)}`;
  }

  if (phone.startsWith("234")) {
    return `0${phone.slice(3)}`;
  }

  return phone;
})(),

        address:
          user.address || "",

        walletBalance:
          user.walletBalance || 0,

        accountType:
          user.accountType || "user",

        sellerSince:
          user.sellerSince || null,

        referralCode:
          user.referralCode || "",

        referralsCount:
          user.referralsCount || 0,

        referralEarnings:
          user.referralEarnings || 0,
      },
    });
  } catch (error) {
    console.error(
      "Profile API Error:",
      error
    );

    

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load profile",
      },
      { status: 500 }
    );
  }
}