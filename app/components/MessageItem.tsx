import React, { useState, useEffect, memo, useMemo } from 'react';
import { Message } from '@/types/llm';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Tooltip, message, Alert, Avatar, Popconfirm, Image as AntdImage } from "antd";
import { CopyOutlined, SyncOutlined, DeleteOutlined, DownOutlined, CheckCircleOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import useModelListStore from '@/app/store/modelList';
import ThinkingIcon from '@/app/images/thinking.svg';
import MarkdownRender from '@/app/components/Markdown';
import { useTranslations } from 'next-intl';

const MessageItem = memo((props: {
  item: Message,
  index: number,
  isConsecutive: boolean;
  role: 'assistant' | 'user' | 'system',
  retryMessage: (index: number) => void,
  deleteMessage: (index: number) => void,
  // 将 isReadOnly 改为 isSharedPage
  isSharedPage?: boolean; 
}
) => {
  const t = useTranslations('Chat');
  const { allProviderListByKey } = useModelListStore();
  const [images, setImages] = useState<string[]>([]);
  const [plainText, setPlainText] = useState('');
  
  useEffect(() => {
    if (Array.isArray(props.item.content) && props.item.content.length > 0) {
      const images = props.item.content.filter((item: any) => item.type === 'image').map((item: any) => item.data);
      setImages(images);
      const plainText = props.item.content.filter((i) => i.type === 'text').map((it) => it.text).join('\n\n')
      setPlainText(plainText);
    } else {
      setPlainText(props.item.content as string);
    }
  }, [props.item]);

  const ProviderAvatar = useMemo(() => {
    if (allProviderListByKey) {
      return (allProviderListByKey && allProviderListByKey[props.item.providerId]?.providerLogo) ? <Avatar
        style={{ marginTop: '0.2rem', 'fontSize': '24px', 'border': '1px solid #eee', 'padding': '2px' }}
        src={allProviderListByKey![props.item.providerId].providerLogo}
      /> : <div className='bg-blue-500 flex mt-1 text-cyan-50 items-center justify-center rounded-full w-8 h-8'>
        {allProviderListByKey && allProviderListByKey[props.item.providerId].providerName.charAt(0)}</div>
    }
    else {
      return <div className='bg-blue-500 flex mt-1 text-cyan-50 items-center justify-center rounded-full w-8 h-8'>
        Bot</div>
    }
  }, [allProviderListByKey, props.item.providerId])

  // 根据 isSharedPage 隐藏或显示操作按钮
  const renderActions = (isUserMessage: boolean) => {
    if (props.isSharedPage) { // 如果是分享页面，不渲染任何操作按钮
      return null;
    }

    if (isUserMessage) {
      return (
        <div className='invisible flex flex-row-reverse pr-1 mt-1 group-hover:visible'>
          <Tooltip title={t('delete')}>
            <Popconfirm
              title={t('deleteNotice')}
              description={t('currentMessageDelete')}
              onConfirm={() => props.deleteMessage(props.index)}
              okText={t('confirm')}
              cancelText={t('cancel')}
              placement='bottom'
            >
              <Button type="text" size='small'>
                <DeleteOutlined style={{ color: 'gray' }} />
              </Button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title={t('retry')}>
            <Button type="text" size='small'
              onClick={() => {
                props.retryMessage(props.index)
              }}
            >
              <SyncOutlined style={{ color: 'gray' }} />
            </Button>
          </Tooltip>
          <CopyToClipboard text={plainText} onCopy={() => {
            message.success(t('copySuccess'));
          }}>
            <Tooltip title={t('copy')}>
              <Button type="text" size='small'>
                <CopyOutlined style={{ color: 'gray' }} />
              </Button>
            </Tooltip>
          </CopyToClipboard>
        </div>
      );
    } else { // Assistant message actions
      return (
        <div className='invisible flex flex-row items-center pl-1 group-hover:visible'>
          <CopyToClipboard text={plainText} onCopy={() => {
            message.success(t('copySuccess'));
          }}>
            <Tooltip title={t('copy')}>
              <Button type="text" size='small'>
                <CopyOutlined style={{ color: 'gray' }} />
              </Button>
            </Tooltip>
          </CopyToClipboard>
          <Tooltip title={t('retry')}>
            <Button type="text" size='small'
              onClick={() => {
                props.retryMessage(props.index - 1)
              }}
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
              placement='bottom'
            >
              <Button type="text" size='small'>
                <DeleteOutlined style={{ color: 'gray' }} />
              </Button>
            </Popconfirm>
          </Tooltip>
          {props.item.totalTokens ? <>
            <span className='text-xs text-gray-500 ml-2'>Tokens:{props.item.totalTokens?.toLocaleString()}</span>
            <span className='text-xs text-gray-500 ml-2'>↑{props.item.inputTokens?.toLocaleString()}</span>
            <span className='text-xs text-gray-500 ml-2'>↓{props.item.outputTokens?.toLocaleString()}</span>
          </> :
            <Tooltip title={t('unknownUsage')}>
              <span className='text-xs text-gray-500 ml-2'>Tokens: - </span>
            </Tooltip>
          }
        </div>
      );
    }
  };

  // 错误消息的渲染逻辑也需要检查并调整
  if (props.item.type === 'error') {
    return (
      <div className="flex container mx-auto px-2 max-w-screen-md w-full flex-col justify-center items-center" >
        <div className='items-start flex  max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row'>
          {ProviderAvatar}
          <div className='flex flex-col w-0 grow group max-w-80'> {/* 调整max-w根据错误类型 */}
            <Alert
              showIcon
              style={{ marginLeft: '0.75rem' }}
              message={
                props.item.errorType === 'TimeoutError' ? t('apiTimeout') :
                props.item.errorType === 'OverQuotaError' ? "超出本月使用限额。请次月再重试，或联系管理员增加额度。" :
                props.item.errorType === 'InvalidAPIKeyError' ? t('apiKeyError') :
                "发生未知错误" // 默认错误信息
              }
              type="warning"
            />
            {!props.isSharedPage && renderActions(false)} {/* 错误消息也禁用操作 */}
          </div>
        </div>
      </div>
    );
  }

  // Break message
  if (props.item.type === 'break') {
    return <div className="flex container mx-auto px-2 max-w-screen-md w-full flex-col justify-center items-center" >
      <div className='items-start flex  max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row'>
        <div className="relative w-full my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">{t('contextCleared')}</span>
          </div>
        </div>
      </div>
    </div>
  }

  if (props.role === 'user') {
    return (
        <div className="flex container mx-auto pl-4 pr-2 max-w-screen-md w-full flex-col justify-center items-center" >
            <div className='items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row-reverse'>
                <div className='flex ml-10 flex-col items-end group'>
                    <div className='flex flex-row gap-2 mb-2'>
                        {images.length > 0 &&
                            images.map((image, index) => (
                                <div key={index} className="flex flex-wrap gap-4">
                                    <AntdImage alt=''
                                        className='block border h-full w-full rounded-md object-cover cursor-pointer'
                                        height={160}
                                        src={image}
                                        preview={{
                                            mask: false
                                        }}
                                    />
                                </div>
                            ))}
                    </div>
                    {typeof props.item.content === 'string' &&
                        <div
                            className='w-fit px-4 py-3 markdown-body !min-w-4 !bg-gray-100 text-base rounded-xl ml-10'
                            style={{ maxWidth: '44rem' }}
                        >
                            <MarkdownRender content={props.item.content} />
                        </div>}
                    {Array.isArray(props.item.content) &&
                        props.item.content.filter((i) => i.type === 'text').map((it) => it.text).join('') !== '' &&
                        <div
                            className='w-fit px-4 py-3 markdown-body !min-w-4 !bg-gray-100 text-base rounded-xl ml-10'
                            style={{ maxWidth: '44rem' }}
                        >
                            <MarkdownRender content={props.item.content.filter((i) => i.type === 'text').map((it) => it.text).join('')} />
                        </div>}
                    {renderActions(true)} {/* 渲染用户消息的操作按钮 */}
                </div>
            </div>
        </div>
    );
  }

  if (props.role === 'assistant') {
    return (
      <div className="flex container mx-auto px-2 max-w-screen-md w-full flex-col justify-center items-center" >
        <div className='items-start flex max-w-3xl text-justify w-full my-0 pt-0 pb-1 flex-row'>
          <div className='flex flex-col h-full'>
            {ProviderAvatar}
            {/* 只有在非共享页面且连续的助手消息才显示连接线 */}
            {!props.isSharedPage && props.isConsecutive && <div className="flex justify-center h-0 grow">
              <div className="h-full border-l border-dashed border-gray-300 my-1"></div>
            </div>}
          </div>
          <div className='flex flex-col w-0 grow group'>
            <div className='pl-3 pr-0 py-2 ml-2  bg-gray-100  text-gray-600 w-full grow markdown-body answer-content rounded-xl'>

              {props.item.searchStatus === "searching" && <div className='flex text-xs flex-row items-center  text-gray-800 bg-gray-100 rounded-md p-2 mb-4'>
                <SearchOutlined style={{ marginLeft: '4px' }} /> <span className='ml-2'>正在联网搜索...</span>
              </div>
              }
              {props.item.searchStatus === "error" && <div className='flex text-xs flex-row items-center  text-gray-800 bg-gray-100 rounded-md p-2 mb-4'>
                <SearchOutlined style={{ marginLeft: '4px' }} /> <span className='ml-2'>搜索出错，请联系管理员检查搜索引擎配置</span>
              </div>
              }
              {props.item.searchStatus === "done" && <div className='flex text-xs flex-row items-center  text-gray-800 bg-gray-100 rounded-md p-2 mb-4'>
                <SearchOutlined style={{ marginLeft: '4px' }} /> <span className='ml-2'>搜索完成</span>
              </div>
              }

              {props.item.reasoninContent &&
                <details open={true} className='text-sm mt-1 mb-4'>
                  <summary
                    className='flex text-xs flex-row items-center hover:bg-gray-200 text-gray-800 bg-gray-100 rounded-md p-2'
                    style={{ display: 'flex' }}
                  >
                    <ThinkingIcon width={16} height={16} style={{ 'fontSize': '10px' }} />
                    <span className='ml-1'>{t('thought')}</span>
                    <DownOutlined
                      className='ml-auto mr-1'
                      style={{
                        color: '#999',
                        transform: `rotate(0deg)`,
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </summary>
                  <div className='border-l-2 border-gray-200 px-2 mt-2 leading-5 text-gray-400'>
                    <MarkdownRender content={props.item.reasoninContent as string} />
                  </div>
                </details>}
              {typeof props.item.content === 'string' && <MarkdownRender content={props.item.content} />
              }

              {
                Array.isArray(props.item.content) && props.item.content.map((part, index) =>
                  <div key={index}>
                    {part.type === 'text' && <MarkdownRender content={part.text} />}
                    {part.type === 'image' && <AntdImage
                      className='cursor-pointer'
                      src={part.data}
                      preview={{ mask: false }}
                      style={{ maxWidth: '250px', borderRadius: '4px', boxShadow: '3px 4px 7px 0px #dedede' }} />}
                  </div>)
              }

              {
                props.item.mcpTools && props.item.mcpTools.map((mcp, index) => {
                  return <details open={false} key={index} className='flex flex-row bg-gray-100 hover:bg-slate-100 text-gray-800 rounded-md mb-3  border border-gray-200 text-sm'>

                    <summary
                      className='flex text-xs flex-row items-center rounded-md p-4'
                      style={{ display: 'flex' }}
                    >
                      <span className='mr-2'>{t('mcpCall')} {mcp.tool?.serverName} {t('sTool')}： {mcp.tool?.name}</span>
                      {
                        mcp.response.isError ?
                          <div><CloseCircleOutlined style={{ color: 'red' }} /><span className='ml-1 text-red-600'>{t('mcpFailed')}</span></div>
                          : <div><CheckCircleOutlined style={{ color: 'green' }} /><span className='ml-1 text-green-700'>{t('mcpFinished')}</span></div>
                      }
                      <DownOutlined
                        className='ml-auto mr-1'
                        style={{
                          color: '#999',
                          transform: `rotate(-90deg)`,
                          transition: 'transform 0.2s ease'
                        }}
                    />
                    </summary>
                    <div className='p-4 pb-0 text-xs border-t'>
                      <span className='mb-2 font-medium'>{t('mcpInput')}</span>
                      <pre className='scrollbar-thin' style={{ marginTop: '6px' }}>{JSON.stringify(mcp.tool.inputSchema, null, 2)}</pre>
                      <span className='mb-2 font-medium'>{t('mcpOutput')}</span>
                      <pre className='scrollbar-thin bg-white' style={{ marginTop: '6px' }}>{JSON.stringify(mcp.response, null, 2)}</pre>
                    </div>
                  </details>
                })
              }
            </div>
            {renderActions(false)} {/* 渲染助手消息的操作按钮 */}
          </div>
        </div>
      </div>
    )
  }
});

MessageItem.displayName = 'MessageItem';
export default MessageItem;
