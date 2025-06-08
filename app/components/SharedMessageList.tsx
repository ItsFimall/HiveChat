"use client";    
import React, { useState, useEffect } from 'react';    
import { useTranslations } from 'next-intl';    
import { getSharedChatInServer } from '@/app/chat/actions/chat';    
import { getMessagesInServer } from '@/app/chat/actions/message';    
import { Message, ChatType } from '@/types/llm';    
    
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
        setError('加载失败');    
      } finally {    
        setIsLoading(false);    
      }    
    };    
    
    loadSharedChat();    
  }, [props.chat_id]);    
    
  if (isLoading) return <div>加载中...</div>;    
  if (error) return <div>{error}</div>;    
    
  return (    
    <div className="shared-chat-container">    
      <div className="shared-chat-header">    
        <h2>{chat?.title}</h2>    
        <span className="shared-badge">只读分享</span>    
      </div>    
      <div className="message-list">    
        {messageList.map((message, index) => (    
          <div key={index} className="message-item">    
            {/* 渲染消息内容，移除所有交互按钮 */}    
          </div>    
        ))}    
      </div>    
    </div>    
  );    
};
