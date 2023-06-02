import AddFriendButton from "@/app/components/AddFriendButton";
import React from "react";

type Props = {};

export default function page({}: Props) {
  return (
    <section className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <AddFriendButton />
    </section>
  );
}
