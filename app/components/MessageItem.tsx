'use client'
import React, { useMemo } from 'react';
import { Avatar } from 'antd'; // Assuming Ant Design Avatar is used
import { useModelListStore } from '@/app/stores/modelListStore'; // Adjust path if necessary
import { Message } from '@/app/types'; // Assuming you have a Message type defined

interface MessageItemProps {
  isConsecutive: boolean;
  role: 'assistant' | 'user' | 'system';
  item: Message; // The message object itself
  index: number;
  retryMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  showGlobalModelName: boolean; // Prop from MessageList to control global visibility
  toggleGlobalModelName: () => void; // Prop from MessageList to toggle global visibility
}

const MessageItem = (props: MessageItemProps) => {
  const { item, role, showGlobalModelName, toggleGlobalModelName } = props;
  const { allProviderListByKey } = useModelListStore(); // Accessing provider list from store

  // Memoized Provider Avatar with click event and conditional name display
  const ProviderAvatar = useMemo(() => {
    // Only render for assistant messages
    if (role !== 'assistant' || !item.providerId) {
      return null;
    }

    const provider = allProviderListByKey?.[item.providerId];

    if (!provider) {
      // Fallback if provider info is not found
      return (
        <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-xs">
          AI
        </div>
      );
    }

    const handleClick = () => {
      toggleGlobalModelName(); // Call the global toggle function
    };

    return (
      <div onClick={handleClick} style={{ cursor: 'pointer' }} className="flex flex-col items-center">
        {/* The actual Avatar component */}
        <Avatar
          src={provider.providerIcon} // Assuming providerIcon exists
          alt={provider.providerName}
          size="small"
          className="bg-gray-200" // Basic styling for the avatar
        >
          {provider.providerName?.charAt(0).toUpperCase()} {/* Fallback for avatar */}
        </Avatar>
        {/* Conditionally display model name based on global state */}
        {showGlobalModelName && (
          <div className="text-xs text-gray-600 mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]">
            {provider.providerName}
          </div>
        )}
      </div>
    );
  }, [role, item.providerId, allProviderListByKey, showGlobalModelName, toggleGlobalModelName]);


  // You would have your existing message rendering logic here
  // This is a simplified representation of how MessageItem might be structured
  return (
    <div className={`flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      {role === 'assistant' && (
        <div className="flex items-start gap-2.5">
          {ProviderAvatar} {/* Render the Provider Avatar */}
          <div className="flex flex-col max-w-full">
            {/* Assistant message content */}
            <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
              <p>{item.content}</p>
              {/* You might also have reasoningContent, mcpTools, etc. here */}
            </div>
          </div>
        </div>
      )}
      {role === 'user' && (
        <div className="flex items-end gap-2.5">
          <div className="flex flex-col max-w-full">
            {/* User message content */}
            <div className="bg-blue-500 text-white p-3 rounded-lg shadow-sm">
              <p>{item.content}</p>
            </div>
          </div>
          {/* User avatar would go here if applicable */}
          <Avatar size="small">U</Avatar> {/* Placeholder for user avatar */}
        </div>
      )}
      {/* Add logic for system messages if applicable */}
    </div>
  );
};

export default MessageItem;
