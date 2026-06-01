// import {
//   NextRequest,
//   NextResponse,
// } from "next/server";

// import { getServerSession } from "next-auth";

// import { authOptions } from "@/lib/auth";

// import { connectToDatabase } from "@/lib/mongodb";

// export async function POST(
//   request: NextRequest
// ) {
//   try {
//     const session =
//       await getServerSession(
//         authOptions
//       );

//     if (!session?.user?.email) {
//       return NextResponse.json(
//         {
//           message: "Unauthorized",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     const body =
//       await request.json();

//     const { reference } = body;

//     if (!reference) {
//       return NextResponse.json(
//         {
//           message:
//             "Reference missing",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     const verifyResponse =
//       await fetch(
//         `https://api.paystack.co/transaction/verify/${reference}`,
//         {
//           method: "GET",

//           headers: {
//             Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

//             "Content-Type":
//               "application/json",
//           },

//           cache: "no-store",
//         }
//       );

//     if (!verifyResponse.ok) {
//       return NextResponse.json(
//         {
//           message:
//             "Unable to verify payment",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     const verifyData =
//       await verifyResponse.json();

//     console.log(
//       "PAYSTACK RESPONSE:",
//       verifyData
//     );

//     if (
//       !verifyData ||
//       !verifyData.status ||
//       !verifyData.data ||
//       verifyData.data.status !==
//         "success"
//     ) {
//       return NextResponse.json(
//         {
//           message:
//             "Payment verification failed",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

// const mongooseConnection =
//   await connectToDatabase();

// const db =
//   mongooseConnection.connection.db;

// if (!db) {
//   throw new Error(
//     "Database not connected"
//   );
// }

//     const user =
//       await db
//         .collection("users")
//         .findOne({
//           email:
//             session.user.email.toLowerCase(),
//         });

//     if (!user) {
//       return NextResponse.json(
//         {
//           message:
//             "User not found",
//         },
//         {
//           status: 404,
//         }
//       );
//     }

//     const existingTransaction =
//       await db
//         .collection(
//           "transactions"
//         )
//         .findOne({
//           reference,
//         });

//     if (
//       existingTransaction
//     ) {
//       return NextResponse.json({
//         success: true,
//       });
//     }

//     const amount =
//       Number(
//         verifyData.data.amount
//       ) / 100;

//     // CREATE WALLET IF NOT EXIST

//     let wallet =
//       await db
//         .collection("wallets")
//         .findOne({
//           userId:
//             user._id.toString(),
//         });

//     if (!wallet) {
//       await db
//         .collection("wallets")
//         .insertOne({
//           userId:
//             user._id.toString(),

//           balance: 0,

//           accountNumber:
//             Math.floor(
//               1000000000 +
//                 Math.random() *
//                   9000000000
//             ).toString(),

//           bankName:
//             "Jel Dev Microfinance Bank",

//           createdAt:
//             new Date(),

//           updatedAt:
//             new Date(),
//         });
//     }

//     // UPDATE WALLET

//     await db
//       .collection("wallets")
//       .updateOne(
//         {
//           userId:
//             user._id.toString(),
//         },
//         {
//           $inc: {
//             balance: amount,
//           },

//           $set: {
//             updatedAt:
//               new Date(),
//           },
//         }
//       );

//     // SAVE TRANSACTION

//     await db
//       .collection(
//         "transactions"
//       )
//       .insertOne({
//         userId:
//           user._id.toString(),

//         type: "credit",

//         amount,

//         description:
//           "Wallet funding",

//         status:
//           "successful",

//         reference,

//         createdAt:
//           new Date(),
//       });

//     return NextResponse.json({
//       success: true,
//     });
//   } catch (error) {
//     console.error(
//       "PAYSTACK VERIFY ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         message:
//           "Internal server error",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }





import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

export async function POST(
  request: NextRequest
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        {
          message:
            "Reference missing",
        },
        {
          status: 400,
        }
      );
    }

    const verifyResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type":
              "application/json",
          },
          cache: "no-store",
        }
      );

    if (!verifyResponse.ok) {
      return NextResponse.json(
        {
          message:
            "Unable to verify payment",
        },
        {
          status: 400,
        }
      );
    }

    const verifyData =
      await verifyResponse.json();

    if (
      !verifyData?.status ||
      !verifyData?.data ||
      verifyData.data.status !==
        "success"
    ) {
      return NextResponse.json(
        {
          message:
            "Payment verification failed",
        },
        {
          status: 400,
        }
      );
    }

    const mongooseConnection =
      await connectToDatabase();

    const db =
      mongooseConnection.connection.db;

    if (!db) {
      throw new Error(
        "Database not connected"
      );
    }

    const user =
      await User.findOne({
        email:
          session.user.email.toLowerCase(),
      });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const existingTransaction =
      await db
        .collection(
          "transactions"
        )
        .findOne({
          reference,
        });

    if (
      existingTransaction
    ) {
      return NextResponse.json({
        success: true,
      });
    }

    const amount =
      Number(
        verifyData.data.amount
      ) / 100;

    // CREATE WALLET IF MISSING
    let wallet =
      await db
        .collection("wallets")
        .findOne({
          userId:
            user._id.toString(),
        });

    if (!wallet) {
      await db
        .collection("wallets")
        .insertOne({
          userId:
            user._id.toString(),

          balance: 0,

          accountNumber:
            Math.floor(
              1000000000 +
                Math.random() *
                  9000000000
            ).toString(),

          bankName:
            "Alifat Connect Pay",

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        });
    }

    // UPDATE WALLET COLLECTION
    await db
      .collection("wallets")
      .updateOne(
        {
          userId:
            user._id.toString(),
        },
        {
          $inc: {
            balance: amount,
          },
          $set: {
            updatedAt:
              new Date(),
          },
        }
      );

    // UPDATE USER BALANCE
    user.walletBalance =
      Number(
        user.walletBalance || 0
      ) + amount;

    await user.save();

    // SAVE TRANSACTION
    await db
      .collection(
        "transactions"
      )
      .insertOne({
        userId:
          user._id.toString(),

        type: "credit",

        category:
          "wallet",

        amount,

        description:
          "Wallet funding",

        status:
          "successful",

        reference,

        createdAt:
          new Date(),
      });

    return NextResponse.json({
      success: true,
      balance:
        user.walletBalance,
    });
  } catch (error) {
    console.error(
      "PAYSTACK VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}