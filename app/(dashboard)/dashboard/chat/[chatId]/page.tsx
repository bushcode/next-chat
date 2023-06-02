import ChatInput from "@/app/components/ChatInput";
import Messages from "@/app/components/Messages";
import { fetchRedis } from "@/app/helpers/redis";
import { AuthOptions } from "@/app/lib/auth";
import { messageArrayValidator } from "@/app/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

export default async function page({ params }: PageProps) {
  const { chatId } = params;
  const session = await getServerSession(AuthOptions);
  if (!session) notFound();

  const { user } = session;
  const [user1, user2] = chatId.split("--");

  if (user.id !== user1 && user.id !== user2) notFound();

  const chatPartnerID = user.id === user1 ? user2 : user1;
  const chatPartner = await fetchRedis("get", `user:${chatPartnerID}`);

  const parsedChatPartner = JSON.parse(chatPartner) as User;

  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={parsedChatPartner.image}
                alt={`${parsedChatPartner.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {parsedChatPartner.name}
              </span>
            </div>

            <span className="text-sm text-gray-600">
              {parsedChatPartner.email}
            </span>
          </div>
        </div>
      </div>
      <Messages
        sessionId={session.user.id}
        initialMessages={initialMessages}
        chatId={chatId}
        sessionImg={session.user.image}
        chatPartner={parsedChatPartner}
      />
      <ChatInput chatId={chatId} chatPartner={parsedChatPartner} />
    </div>
  );
}
