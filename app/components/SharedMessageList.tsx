"use client";
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getSharedChatInServer } from '@/app/chat/actions/chat';
import { getMessagesInServer } from '@/app/chat/actions/message';
import { Message, ChatType } from '@/types/llm';
import MessageItem from '@/app/components/MessageItem';

export const SharedMessageList = (props: { chat_id: string }) => {
  const t = useTranslations('Chat');
  const [chat, setChat] = useState<ChatType | null>(null);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertChatNullToUndefined = (obj: any): ChatType => {
    const converted = { ...obj };
    Object.keys(converted).forEach(key => {
      if (converted[key] === null) {
        converted[key] = undefined;
      }
    });
    return converted;
  };

  const convertMessagesNullToUndefined = (messages: any[]): Message[] => {
    return messages.map(msg => ({
      ...msg,
      content: msg.content ?? '',
      reasoninContent: msg.reasoninContent ?? undefined,
      deleteAt: msg.deleteAt ?? undefined,
    }));
  };

  useEffect(() => {
    const loadSharedChat = async () => {
      try {
        const chatResult = await getSharedChatInServer(props.chat_id);
        if (chatResult.status !== 'success' || !chatResult.data) {
          setError('此聊天未开启分享或不存在');
          return;
        }
        setChat(convertChatNullToUndefined(chatResult.data));

        const messagesResult = await getMessagesInServer(props.chat_id);
        if (messagesResult.status === 'success') {
          setMessageList(convertMessagesNullToUndefined(messagesResult.data || []));
        }
      } catch (err) {
        console.error("加载共享聊天失败:", err);
        setError('加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedChat();
  }, [props.chat_id]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        加载中...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-500">
        {error}
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm py-3">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-lg font-semibold text-gray-800 truncate text-center">
            {chat?.title || '共享聊天'}
          </h1>
        </div>
      </header>

      {/* 聊天内容 */}
      <main className="flex-grow overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="max-w-3xl mx-auto space-y-4">
          {messageList.map((message, index) => (
            <MessageItem
              key={message.id || index}
              item={message}
              index={index}
              role={message.role as 'assistant' | 'user' | 'system'}
              isConsecutive={false}
              retryMessage={() => {}}
              deleteMessage={() => {}}
              isSharedPage={true}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
