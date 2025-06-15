import React, { useMemo, useState, useCallback } from 'react';
import MarkdownRender from '@/app/components/Markdown';
import { Avatar, Image as AntdImage } from 'antd';
import { ResponseContent } from '@/types/llm';
import DotsLoading from '@/app/components/loading/DotsLoading';
import BallsLoading from '@/app/components/loading/BallsLoading';
import { CheckCircleOutlined, RedoOutlined, DownOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ThinkingIcon from '@/app/images/thinking.svg';
import useModelListStore from '@/app/store/modelList';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

// Optimized search status indicator
const SearchStatusIndicator = React.memo(({ status }: { status: 'none' | 'searching' | 'error' | 'done' }) => {
  if (status === 'none') return null;

  const statusMessages = {
    searching: '正在联网搜索...',
    error: '搜索出错，请联系管理员检查搜索引擎配置',
    done: '搜索完成'
  };

  return (
    <div className={clsx(
      'flex text-xs flex-row items-center text-gray-800 bg-gray-100 rounded-md p-2 mb-4',
      'transition-all duration-300 ease-out'
    )}>
      <SearchOutlined className="animate-pulse" />
      <span className="ml-2">{statusMessages[status]}</span>
    </div>
  );
});
SearchStatusIndicator.displayName = 'SearchStatusIndicator';

// Optimized tool invocation details component
const ToolInvocationDetails = React.memo(({
  mcp,
  isOpen,
  toolId,
  onToggle
}: {
  mcp: any;
  isOpen: boolean;
  toolId: string;
  onToggle: (id: string) => void;
}) => {
  return (
    <div className={clsx(
      'bg-gray-100 hover:bg-slate-100 text-gray-800 rounded-md mb-3 border border-gray-200 text-sm',
      'transition-all duration-200 ease-in-out overflow-hidden',
      isOpen ? 'max-h-[500px]' : 'max-h-[56px]'
    )}>
      <div
        className="flex text-xs flex-row items-center rounded-md p-4 cursor-pointer select-none"
        onClick={() => onToggle(toolId)}
      >
        <span className="mr-2">调用 {mcp.tool.serverName} 的工具： {mcp.tool.name}</span>
        {mcp.status === 'done' && mcp.response.isError && (
          <div><CloseCircleOutlined className="text-red-500" /><span className="ml-1 text-red-600">调用失败</span></div>
        )}
        {mcp.status === 'done' && !mcp.response.isError && (
          <div><CheckCircleOutlined className="text-green-500" /><span className="ml-1 text-green-700">已完成</span></div>
        )}
        {mcp.status === 'invoking' && (
          <div>
            <RedoOutlined spin className="text-green-500" /><span className="ml-1 text-green-700">执行中</span>
          </div>
        )}
        <DownOutlined
          className="ml-auto mr-1"
          style={{
            color: '#999',
            transform: `rotate(${isOpen ? 180 : 0}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
      {isOpen && (
        <div className="p-4 pt-0 text-xs">
          <pre className="scrollbar-thin opacity-0 animate-fadeIn">{JSON.stringify(mcp.response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
});
ToolInvocationDetails.displayName = 'ToolInvocationDetails';

const ResponsingMessage = (props: {
  searchStatus: 'none' | 'searching' | 'error' | 'done';
  responseStatus: string;
  responseMessage: ResponseContent;
  currentProvider: string;
}) => {
  const { allProviderListByKey } = useModelListStore();
  const [openToolIds, setOpenToolIds] = useState<Record<string, boolean>>({});
  const t = useTranslations('Chat');
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = useCallback((toolId: string) => {
    setOpenToolIds(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  }, []);

  const providerAvatar = useMemo(() => {
    if (allProviderListByKey && allProviderListByKey[props.currentProvider]?.providerLogo) {
      return (
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Avatar
            className="mt-1 border border-solid border-gray-200 p-0.5"
            src={allProviderListByKey[props.currentProvider].providerLogo}
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          />
        </div>
      );
    }
    return (
      <div 
        className="bg-blue-500 flex mt-1 text-cyan-50 items-center justify-center rounded-full w-8 h-8"
        style={{
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {allProviderListByKey && allProviderListByKey[props.currentProvider]?.providerName?.charAt(0)}
      </div>
    );
  }, [props.currentProvider, allProviderListByKey, isHovered]);

  if (props.responseStatus !== 'pending') return null;

  const renderContent = () => {
    if (typeof props.responseMessage.content === 'string') {
      return (
        <MarkdownRender 
          content={props.responseMessage.content} 
          className={clsx(
            'opacity-0 animate-fadeInUp',
            props.responseMessage.content.length > 0 && 'opacity-100'
          )} 
        />
      );
    }

    if (Array.isArray(props.responseMessage.content)) {
      return props.responseMessage.content.map((part, index) => (
        <div key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
          {part.type === 'text' && <MarkdownRender content={part.text} />}
          {part.type === 'image' && (
            <AntdImage
              className="cursor-pointer transition-all duration-300 hover:shadow-md"
              src={part.data}
              preview={{ mask: false }}
              style={{ 
                maxWidth: '250px', 
                borderRadius: '4px', 
                boxShadow: '3px 4px 7px 0px #dedede',
                animation: 'fadeIn 0.5s ease-out'
              }} 
            />
          )}
        </div>
      ));
    }

    return null;
  };

  return (
    <div className="flex container mx-auto px-2 max-w-screen-md w-full flex-col justify-center items-center pointer-events-auto">
      <div className="items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row pointer-events-auto">
        {providerAvatar}
        <div className="flex flex-col w-0 grow pointer-events-auto">
          <div className="px-3 py-2 ml-2 bg-gray-100 text-gray-600 w-full grow markdown-body answer-content rounded-xl pointer-events-auto transition-all duration-300 hover:bg-gray-50">
            <SearchStatusIndicator status={props.searchStatus} />

            {props.responseMessage.reasoningContent && (
              <div className="text-sm mb-4 animate-fadeIn">
                <div className="flex text-xs flex-row items-center text-gray-800 bg-gray-100 rounded-md p-2 transition-colors duration-200">
                  <ThinkingIcon width={16} height={16} className="animate-pulse" />
                  <span className="ml-1">
                    {props.responseMessage.content ? t('thought') : t('thinking')}
                  </span>
                </div>
                <div className="border-l-2 border-gray-200 px-2 mt-2 leading-5 text-gray-400 transition-all duration-300">
                  <MarkdownRender content={props.responseMessage.reasoningContent as string} />
                </div>
              </div>
            )}

            <div className="pointer-events-auto space-y-2">
              {renderContent()}
            </div>

            <div className="pointer-events-auto mt-2">
              {props.responseMessage.mcpTools?.map((mcp, index) => {
                const toolId = `${mcp.tool.serverName}-${mcp.tool.name}-${index}`;
                return (
                  <ToolInvocationDetails
                    key={toolId}
                    mcp={mcp}
                    isOpen={!!openToolIds[toolId]}
                    toolId={toolId}
                    onToggle={handleToggle}
                  />
                );
              })}
            </div>

            {(!props.responseMessage.content && !props.responseMessage.reasoningContent) && (
              <DotsLoading className="animate-pulse" />
            )}
          </div>

          {(props.responseMessage.content || props.responseMessage.reasoningContent) && (
            <div className="px-3 animate-bounce">
              <BallsLoading />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(5px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default React.memo(ResponsingMessage);
