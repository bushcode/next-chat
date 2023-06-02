import { fetchRedis } from "@/app/helpers/redis";
import { AuthOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { pusherServer } from "@/app/lib/pusher";
import { toPusherKey } from "@/app/lib/utils";
import { addFriendValidator } from "@/app/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    const iDToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    if (!iDToAdd) {
      return new Response("User not found", { status: 400 });
    }

    const session = await getServerSession(AuthOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (iDToAdd === session?.user.id) {
      return new Response("You can't add yourself as a friend", {
        status: 400,
      });
    }

    //check if the user is already as friend
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${iDToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }

    // check if user is already added
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      iDToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response("Already friends with this user", { status: 400 });
    }

    pusherServer.trigger(
      toPusherKey(`user:${iDToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    );

    //valid request, send the request
    db.sadd(`user:${iDToAdd}:incoming_friend_requests`, session.user.id);
    return new Response("Friend request sent", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("invalid request payload", { status: 400 });
    }
    return new Response("Invalid request payload", { status: 500 });
  }
}
