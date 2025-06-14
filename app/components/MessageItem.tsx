'use client';

import React, { useState, useEffect, memo, useMemo } from 'react';
import { Message, LLMModel, LLMModelProvider } from '@/types/llm';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Button,
  Tooltip,
  message,
  Alert,
  Avatar,
  Popconfirm,
  Image as AntdImage,
} from 'antd';
import {
  CopyOutlined,
  SyncOutlined,
  DeleteOutlined,
  DownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import useModelListStore from '@/app/store/modelList';
import ThinkingIcon from '@/app/images/thinking.svg';
import MarkdownRender from '@/app/components/Markdown';
import { useTranslations } from 'next-intl';

const MessageItem = memo(
  (props: {
    item: Message;
    index: number;
    isConsecutive: boolean;
    role: 'assistant' | 'user' | 'system';
    retryMessage: (index: number) => void;
    deleteMessage: (index: number) => void;
    isSharedPage?: boolean;
    showGlobalModelName: boolean;
    toggleGlobalModelName: () => void;
  }) => {
    const t = useTranslations('Chat');

    const { allProviderListByKey, modelListByKey } = useModelListStore();
    const [images, setImages] = useState<string[]>([]);
    const [plainText, setPlainText] = useState('');

    const { role, item, showGlobalModelName, toggleGlobalModelName } = props;

    useEffect(() => {
      if (Array.isArray(item.content) && item.content.length > 0) {
        const imgs = item.content
          .filter((c: any) => c.type === 'image')
          .map((c: any) => c.data);
        setImages(imgs);

        const txt = item.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text)
          .join('\n\n');
        setPlainText(txt);
      } else {
        setPlainText(item.content as string);
      }
    }, [item]);

    /* -------------------------------------------------------------------- */
    /*                              Avatar part                             */
    /* -------------------------------------------------------------------- */

    const ProviderAvatar = useMemo(() => {
      if (role !== 'assistant' || !item.providerId || !item.model) return null;

      const specificModel: LLMModel | undefined = modelListByKey?.[item.model];
      const provider: LLMModelProvider | undefined =
        allProviderListByKey?.[item.providerId];

      const nameToDisplay =
        specificModel?.displayName || provider?.providerName || 'Bot';

      const logoSrc = provider?.providerLogo;

      const handleClick = () => toggleGlobalModelName?.();

      /* If nothing is recognised, fall back to a simple "AI" bubble */
      if (!specificModel && !provider) {
        return (
          <div
            onClick={handleClick}
            className="bg-blue-500 flex mt-1 text-cyan-50 items-center justify-center rounded-full w-8 h-8 cursor-pointer"
          >
            AI
          </div>
        );
      }

      return (
        <div
          onClick={handleClick}
          className="flex flex-col items-center cursor-pointer"
        >
          {logoSrc ? (
            <Avatar
              style={{
                marginTop: '0.2rem',
                fontSize: '24px',
                border: '1px solid #eee',
                padding: '2px',
              }}
              src={logoSrc}
              alt={`${nameToDisplay} Avatar`}
            />
          ) : (
            <div className="bg-blue-500 flex mt-1 text-cyan-50 items-center justify-center rounded-full w-8 h-8">
              {nameToDisplay.charAt(0)}
            </div>
          )}

          {showGlobalModelName && (
            <Tooltip placement="top" title={nameToDisplay}>
              <div className="text-xs text-gray-600 mt-1 text-center break-all leading-tight max-w-[70px]">
                {nameToDisplay}
              </div>
            </Tooltip>
          )}
        </div>
      );
    }, [
      allProviderListByKey,
      modelListByKey,
      item.providerId,
      item.model,
      role,
      showGlobalModelName,
      toggleGlobalModelName,
    ]);

    /* -------------------------------------------------------------------- */
    /*                              UI helpers                              */
    /* -------------------------------------------------------------------- */

    const renderActions = (isUserMessage: boolean) => (
      <div
        className={`${
          isUserMessage ? 'flex-row-reverse pr-1' : 'flex-row pl-1'
        } invisible flex mt-1 group-hover:visible`}
      >
        <CopyToClipboard
          text={plainText}
          onCopy={() => message.success(t('copySuccess'))}
        >
          <Tooltip title={t('copy')}>
            <Button type="text" size="small">
              <CopyOutlined style={{ color: 'gray' }} />
            </Button>
          </Tooltip>
        </CopyToClipboard>

        {!props.isSharedPage && (
          <>
            <Tooltip title={t('retry')}>
              <Button
                type="text"
                size="small"
                onClick={() =>
                  props.retryMessage(
                    isUserMessage ? props.index : props.index - 1,
                  )
                }
              >
                <SyncOutlined style={{ color: 'gray' }} />
              </Button>
            </Tooltip>

            <Tooltip title={t('delete')}>
              <Popconfirm
                title={t('deleteNotice')}
                description={t('currentMessageDelete')}
                onConfirm={() => props.deleteMessage(props.index)}
                okText={t('confirm')}
                cancelText={t('cancel')}
                placement="bottom"
              >
                <Button type="text" size="small">
                  <DeleteOutlined style={{ color: 'gray' }} />
                </Button>
              </Popconfirm>
            </Tooltip>

            {!isUserMessage && props.item.totalTokens && (
              <>
                <span className="text-xs text-gray-500 ml-2">
                  Tokens: {props.item.totalTokens?.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ↑{props.item.inputTokens?.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ↓{props.item.outputTokens?.toLocaleString()}
                </span>
              </>
            )}
          </>
        )}
      </div>
    );

    /* -------------------------------------------------------------------- */
    /*                     Different message type renderers                  */
    /* -------------------------------------------------------------------- */

    if (item.type === 'error') {
      return (
        <div className="flex container mx-auto px-2 max-w-screen-md w-full flex-col justify-center items-center">
          <div className="items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row">
            {ProviderAvatar}
            <div className="flex flex-col w-0 grow group max-w-80">
              <Alert
                showIcon
                style={{ marginLeft: '0.75rem' }}
                message={
                  item.errorType === 'TimeoutError'
                    ? t('apiTimeout')
                    : item.errorType === 'OverQuotaError'
                    ? '超出本月使用限额。请次月再重试，或联系管理员增加额度。'
                    : item.errorType === 'InvalidAPIKeyError'
                    ? t('apiKeyError')
                    : '发生未知错误'
                }
                type="warning"
              />
              {renderActions(false)}
            </div>
          </div>
        </div>
      );
    }

    if (item.type === 'break') {
      return (
        <div className="flex container mx-auto px-2 max-w-screen-md w-full flex-col justify-center items-center">
          <div className="items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row">
            <div className="relative w-full my-6">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">
                  {t('contextCleared')}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (role === 'user') {
      return (
        <div className="flex container mx-auto pl-4 pr-2 max-w-screen-md w-full flex-col justify-center items-center">
          <div className="items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row-reverse">
            <div className="flex ml-10 flex-col items-end group">
              <div className="flex flex-row gap-2 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="flex flex-wrap gap-4">
                    <AntdImage
                      alt=""
                      className="block border h-full w-full rounded-md object-cover cursor-pointer"
                      height={160}
                      src={img}
                      preview={{ mask: false }}
                    />
                  </div>
                ))}
              </div>

              <div
                className="w-fit px-4 py-3 markdown-body !min-w-4 !bg-gray-100 text-base rounded-xl ml-10"
                style={{ maxWidth: '44rem' }}
              >
                <MarkdownRender content={plainText} />
              </div>

              {renderActions(true)}
            </div>
          </div>
        </div>
      );
    }

    /* ---------------------------- assistant ---------------------------- */
    return (
      <div className="flex container mx-auto px-2 max-w-screen-md w-full flex-col justify-center items-center">
        <div className="items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row">
          <div className="flex flex-col h-full">
            {ProviderAvatar}

            {!props.isSharedPage && props.isConsecutive && (
              <div className="flex justify-center h-0 grow">
                <div className="h-full border-l border-dashed border-gray-300 my-1"></div>
              </div>
            )}
          </div>

          <div className="flex flex-col w-0 grow group">
            <div className="pl-3 pr-0 py-2 ml-2 bg-gray-100 text-gray-600 w-full grow markdown-body answer-content rounded-xl">
              {item.searchStatus === 'searching' && (
                <div className="flex text-xs flex-row items-center bg-gray-100 rounded-md p-2 mb-4">
                  <SearchOutlined style={{ marginLeft: '4px' }} />
                  <span className="ml-2">正在联网搜索...</span>
                </div>
              )}
              {item.searchStatus === 'error' && (
                <div className="flex text-xs flex-row items-center bg-gray-100 rounded-md p-2 mb-4">
                  <SearchOutlined style={{ marginLeft: '4px' }} />
                  <span className="ml-2">
                    搜索出错，请联系管理员检查搜索引擎配置
                  </span>
                </div>
              )}
              {item.searchStatus === 'done' && (
                <div className="flex text-xs flex-row items-center bg-gray-100 rounded-md p-2 mb-4">
                  <SearchOutlined style={{ marginLeft: '4px' }} />
                  <span className="ml-2">搜索完成</span>
                </div>
              )}

              {item.reasoninContent && (
                <details open className="text-sm mt-1 mb-4">
                  <summary className="flex text-xs flex-row items-center hover:bg-gray-200 text-gray-800 bg-gray-100 rounded-md p-2">
                    <ThinkingIcon width={16} height={16} />
                    <span className="ml-1">{t('thought')}</span>
                    <DownOutlined
                      className="ml-auto mr-1"
                      style={{ color: '#999', transition: 'transform 0.2s ease' }}
                    />
                  </summary>
                  <div className="border-l-2 border-gray-200 px-2 mt-2 leading-5 text-gray-400">
                    <MarkdownRender content={item.reasoninContent as string} />
                  </div>
                </details>
              )}

              {Array.isArray(item.content) ? (
                item.content.map((part, idx) => (
                  <div key={idx}>
                    {part.type === 'text' && (
                      <MarkdownRender content={part.text} />
                    )}
                    {part.type === 'image' && (
                      <AntdImage
                        className="cursor-pointer"
                        src={part.data}
                        preview={{ mask: false }}
                        style={{
                          maxWidth: '250px',
                          borderRadius: '4px',
                          boxShadow: '3px 4px 7px 0px #dedede',
                        }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <MarkdownRender content={item.content} />
              )}

              {item.mcpTools?.map((mcp, idx) => (
                <details
                  key={idx}
                  className="flex flex-row bg-gray-100 hover:bg-slate-100 text-gray-800 rounded-md mb-3 border border-gray-200 text-sm"
                >
                  <summary className="flex text-xs flex-row items-center rounded-md p-4">
                    <span className="mr-2">
                      {t('mcpCall')} {mcp.tool?.serverName} {t('sTool')}：
                      {mcp.tool?.name}
                    </span>
                    {mcp.response.isError ? (
                      <div>
                        <CloseCircleOutlined style={{ color: 'red' }} />
                        <span className="ml-1 text-red-600">
                          {t('mcpFailed')}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <CheckCircleOutlined style={{ color: 'green' }} />
                        <span className="ml-1 text-green-700">
                          {t('mcpFinished')}
                        </span>
                      </div>
                    )}
                    <DownOutlined
                      className="ml-auto mr-1"
                      style={{ color: '#999', transition: 'transform 0.2s ease' }}
                    />
                  </summary>
                  <div className="p-4 pb-0 text-xs border-t">
                    <span className="mb-2 font-medium">{t('mcpInput')}</span>
                    <pre className="scrollbar-thin">
                      {JSON.stringify(mcp.tool.inputSchema, null, 2)}
                    </pre>
                    <span className="mb-2 font-medium">{t('mcpOutput')}</span>
                    <pre className="scrollbar-thin bg-white">
                      {JSON.stringify(mcp.response, null, 2)}
                    </pre>
                  </div>
                </details>
              ))}
            </div>

            {renderActions(false)}
          </div>
        </div>
      </div>
    );
  },
);

MessageItem.displayName = 'MessageItem';

export default MessageItem;
