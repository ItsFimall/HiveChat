"use client";   
import React, { useState, useEffect } from 'react';   
import { useTranslations } from 'next-intl';   
import { getSharedChatInServer } from '@/app/chat/actions/chat';   
import { getMessagesInServer } from '@/app/chat/actions/message';   
import { Message, ChatType } from '@/types/llm';   
import MessageItem from '@/app/components/MessageItem'; // 导入 MessageItem
   
export const SharedMessageList = (props: { chat_id: string }) => {   
  const t = useTranslations('Chat');   
  const [chat, setChat] = useState<ChatType | null>(null);   
  const [messageList, setMessageList] = useState<Message[]>([]);   
  const [isLoading, setIsLoading] = useState(true);   
  const [error, setError] = useState<string | null>(null);   
   
  // 转换聊天对象：将 null 值转换为 undefined  
  const convertChatNullToUndefined = (obj: any): ChatType => {  
    const converted = { ...obj };  
    Object.keys(converted).forEach(key => {  
      if (converted[key] === null) {  
        converted[key] = undefined;  
      }  
    });  
    return converted;  
  };  
   
  // 转换消息数组：将 null 值转换为合适的默认值  
  const convertMessagesNullToUndefined = (messages: any[]): Message[] => {  
    return messages.map(msg => ({  
      ...msg,  
      content: msg.content ?? '', // 将 null 转换为空字符串  
      reasoninContent: msg.reasoninContent ?? undefined,  
      // 转换其他可能为 null 的字段  
      deleteAt: msg.deleteAt ?? undefined,  
    }));  
  };  
   
  useEffect(() => {   
    const loadSharedChat = async () => {   
      try {   
        // 验证聊天是否开启分享   
        const chatResult = await getSharedChatInServer(props.chat_id);   
        if (chatResult.status !== 'success' || !chatResult.data) {   
          setError('此聊天未开启分享或不存在');   
          return;   
        }   
            
        // 使用转换函数处理数据库返回的聊天数据  
        setChat(convertChatNullToUndefined(chatResult.data));   
            
        // 获取消息列表   
        const messagesResult = await getMessagesInServer(props.chat_id);   
        if (messagesResult.status === 'success') {   
          // 使用转换函数处理数据库返回的消息数据  
          setMessageList(convertMessagesNullToUndefined(messagesResult.data || []));   
        }   
      } catch (err) {   
        console.error("加载共享聊天失败:", err); // 添加更详细的错误日志
        setError('加载失败');   
      } finally {   
        setIsLoading(false);   
      }   
    };   
   
    loadSharedChat();   
  }, [props.chat_id]);   
   
  if (isLoading) return <div className="flex justify-center items-center h-screen text-lg">加载中...</div>;   
  if (error) return <div className="flex justify-center items-center h-screen text-lg text-red-500">{error}</div>;   
   
  return (   
    // 添加一些基本的 Tailwind CSS 类，以确保页面有基本的布局和可读性
    <div className="flex flex-col h-screen bg-gray-50 overflow-auto">
      <div className="w-full max-w-screen-md mx-auto py-4 px-4 bg-white shadow-sm border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">{chat?.title || '共享聊天'}</h2>
        <div className="flex justify-center">
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                只读分享
            </span>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto py-6 message-list scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messageList.map((message, index) => (   
          <MessageItem 
            key={message.id || index} 
            item={message} 
            index={index} 
            role={message.role as 'assistant' | 'user' | 'system'} // 确保类型正确
            isConsecutive={false} // 共享页面通常不需要连续消息的连接线
            retryMessage={() => {}} // 禁用操作，传递空函数
            deleteMessage={() => {}} // 禁用操作，传递空函数
            isSharedPage={true} // 关键：设置为只读
          />   
        ))}   
      </div>   
    </div>   
  );   
};
