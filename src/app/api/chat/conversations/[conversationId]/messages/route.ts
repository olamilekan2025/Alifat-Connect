// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import { objectId, serializeMessage } from "../../../../../../lib/chat-utils";
// import { requireChatUser } from "../../../../../../lib/chat-auth";
// import { Conversation } from "../../../../../../models/Conversation";
// import { Message } from "../../../../../../models/Message";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ conversationId: string }> }
// ) {
//   await connectDB();

//   const { conversationId: id } = await params;

//   const user = await requireChatUser();
//   const conversationId = objectId(id);
//   const cursor = req.nextUrl.searchParams.get("cursor");
//   const search = req.nextUrl.searchParams.get("search") || "";
//   const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 30), 100);

//   const conversation = await Conversation.findById(conversationId);
//   if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   if (user.role !== "admin" && String(conversation.user) !== user.id) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const query: Record<string, unknown> = { conversationId };
//   if (cursor) query.createdAt = { $lt: new Date(cursor) };
//   if (search) query.$text = { $search: search };

//   const messages = await Message.find(query).sort({ createdAt: -1 }).limit(limit + 1);
//   const hasMore = messages.length > limit;
//   const page = messages.slice(0, limit).reverse();

//   const serializedMessages = page.map((msg) =>
//     serializeMessage(msg.toObject() as Record<string, unknown>),
//   );

//   return NextResponse.json({
//     messages: serializedMessages,
//     nextCursor: hasMore ? messages[limit - 1].createdAt : null
//   });
// }



// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import { objectId, serializeMessage } from "../../../../../../lib/chat-utils";
// import { requireChatUser } from "../../../../../../lib/chat-auth";
// import { Conversation } from "../../../../../../models/Conversation";
// import { Message } from "../../../../../../models/Message";
// import mongoose from "mongoose";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ conversationId: string }> }
// ) {
//   try {
//     await connectDB();

//    const { conversationId: id } = await params;

// const user = await requireChatUser();
// if (!mongoose.Types.ObjectId.isValid(id)) {
//   return NextResponse.json(
//     { error: "Invalid conversation id", id },
//     { status: 400 }
//   );
// }

// const conversationId = new mongoose.Types.ObjectId(id);

//    const conversation = await Conversation.findById(id);

//     if (!conversation) {
//       return NextResponse.json(
//         { error: "Conversation not found" },
//         { status: 404 }
//       );
//     }

//     if (
//       user.role !== "admin" &&
//       String(conversation.user) !== String(user.id)
//     ) {
//       return NextResponse.json(
//         { error: "Forbidden" },
//         { status: 403 }
//       );
//     }

//     const cursor = req.nextUrl.searchParams.get("cursor");
//     const search = req.nextUrl.searchParams.get("search") || "";
//     const limit = Math.min(
//       Number(req.nextUrl.searchParams.get("limit") || 30),
//       100
//     );

//     const query: any = {
//       conversationId,
//     };

//     if (cursor) {
//       query.createdAt = {
//         $lt: new Date(cursor),
//       };
//     }

//     if (search) {
//       query.$text = {
//         $search: search,
//       };
//     }

//     const messages = await Message.find(query)
//       .sort({ createdAt: -1 })
//       .limit(limit + 1);

//     const hasMore = messages.length > limit;

//     const page = messages.slice(0, limit).reverse();

//     return NextResponse.json({
//       messages: page.map((m) =>
//         serializeMessage(m.toObject())
//       ),
//       nextCursor: hasMore
//         ? messages[limit - 1].createdAt
//         : null,
//     });
//   } catch (error) {
//     console.error("GET MESSAGES ERROR:", error);

//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Internal server error",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { serializeMessage } from "../../../../../../lib/chat-utils";
import { requireChatUser } from "../../../../../../lib/chat-auth";
import { Conversation } from "../../../../../../models/Conversation";
import { Message } from "../../../../../../models/Message";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await connectDB();

    const { conversationId: id } = await params;

    const user = await requireChatUser();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid conversation id:", id);

      return NextResponse.json(
        {
          error: "Invalid conversation id",
        },
        {
          status: 400,
        }
      );
    }

    const conversationId = new mongoose.Types.ObjectId(id);

    // IMPORTANT: Use conversationId instead of id
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      console.error("Conversation not found:", id);

      return NextResponse.json(
        {
          error: "Conversation not found",
        },
        {
          status: 404,
        }
      );
    }

    // Permission check
    if (
      user.role !== "admin" &&
      String(conversation.user) !== String(user.id)
    ) {
      console.error("Forbidden access", {
        conversationUser: String(conversation.user),
        loggedInUser: String(user.id),
      });

      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const cursor = req.nextUrl.searchParams.get("cursor");
    const search = req.nextUrl.searchParams.get("search") ?? "";

    const limit = Math.min(
      Number(req.nextUrl.searchParams.get("limit") ?? 30),
      100
    );

    const query: Record<string, any> = {
      conversationId,
    };

    if (cursor) {
      query.createdAt = {
        $lt: new Date(cursor),
      };
    }

    if (search) {
      query.$text = {
        $search: search,
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;

    const page = messages.slice(0, limit).reverse();

    return NextResponse.json({
      messages: page.map((message) =>
        serializeMessage(message.toObject())
      ),
      nextCursor: hasMore
        ? messages[limit - 1].createdAt
        : null,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}