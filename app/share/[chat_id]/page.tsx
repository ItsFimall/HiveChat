"use client";  
import React from 'react';  
import { SharedMessageList } from '@/app/components/SharedMessageList';  
  
export default function SharedChat({ params }: { params: { chat_id: string } }) {  
  const chatId = params.chat_id;  
  return <SharedMessageList chat_id={chatId} />;  
}
