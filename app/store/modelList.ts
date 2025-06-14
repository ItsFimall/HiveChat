// app/store/modelList.ts

import { create } from 'zustand';
import { LLMModel, LLMModelProvider, LLMModelRealId, Message } from '@/types/llm';
import { llmModelType } from '@/app/db/schema'; // Assuming this defines the shape of data from your DB

interface IModelListStore {
  currentModel: LLMModel;
  providerList: LLMModelProvider[];
  providerListByKey: { [key: string]: LLMModelProvider } | null;
  allProviderListByKey: { [key: string]: LLMModelProvider } | null;
  allProviderList: LLMModelProvider[];
  modelList: LLMModel[];
  modelListRealId: LLMModelRealId[];
  isPending: Boolean;
  setIsPending: (isPending: boolean) => void;
  initModelListRealId: (initModels: llmModelType[]) => Promise<void>;
  initModelList: (initModels: llmModelType[]) => void;
  setModelList: (newOrderModels: LLMModel[]) => void;
  setAllProviderList: (newProviderList: LLMModelProvider[]) => void;
  initAllProviderList: (initModels: LLMModelProvider[]) => Promise<void>;
  addCustomProvider: (initModels: LLMModelProvider) => Promise<void>;
  renameProvider: (providerId: string, newName: string) => Promise<void>;
  deleteCustomProvider: (providerId: string) => Promise<void>;
  toggleProvider: (providerId: string, selected: boolean) => Promise<void>;
  changeSelect: (modelId: string, selected: boolean) => Promise<void>;
  addCustomModel: (model: LLMModel) => Promise<void>;
  updateCustomModel: (modelId: string, model: LLMModel) => Promise<void>;
  deleteCustomModel: (modelId: string) => Promise<void>;
  setCurrentModel: (model: string) => void;
  setCurrentModelExact: (providerId: string, modelId: string,) => void;

  // NEW: Add a mapping for models by ID for quick lookup
  modelListByKey: { [key: string]: LLMModel } | null;
}

const useModelListStore = create<IModelListStore>((set, get) => ({
  currentModel: {
    id: 'gpt-4o-mini',
    displayName: 'FimallAI 4o Mini',
    supportVision: true,
    supportTool: true,
    maxTokens: 131072,
    selected: true,
    provider: {
      id: 'openai',
      providerName: 'Open AI',
      // providerLogo: '...', // If you have a default logo here, add it
    }
  },
  providerList: [],
  providerListByKey: null,
  allProviderListByKey: null,
  allProviderList: [],
  modelList: [],
  modelListRealId: [], // Note: modelListRealId is not being used for model lookup in MessageItem, just modelList.
  isPending: true,
  setIsPending: (isPending: boolean) => {
    set((state) => ({
      ...state,
      isPending,
    }));
  },
  setAllProviderList: (newProviderList: LLMModelProvider[]) => {
    set((state) => ({
      ...state,
      allProviderList: newProviderList,
    }));
  },
  setModelList: (newOrderModels: LLMModel[]) => {
    const modelByKey = newOrderModels.reduce<{ [key: string]: LLMModel }>((result, model) => {
      result[model.id] = model;
      return result;
    }, {});

    set((state) => ({
      ...state,
      modelList: newOrderModels,
      modelListByKey: modelByKey, // Ensure this is always updated
    }));
  },
  initModelList: (initModels: llmModelType[]) => {
    const newData: LLMModel[] = initModels.map((model) => ({
      id: model.name, // The model's ID is 'name' from llmModelType
      displayName: model.displayName,
      maxTokens: model.maxTokens || undefined,
      supportVision: model.supportVision || undefined,
      supportTool: model.supportTool || undefined,
      selected: model.selected || false,
      type: model.type ?? 'default',
      provider: {
        id: model.providerId,
        providerName: model.providerName,
        providerLogo: model.providerLogo, // Include providerLogo here if llmModelType provides it
      }
    }));

    const providerList = Array.from(
      new Map(
        initModels.map((model) => [
          model.providerId,
          {
            id: model.providerId,
            providerName: model.providerName,
            providerLogo: model.providerLogo,
            status: true,
          }
        ])
      ).values()
    );

    const modelByKey = newData.reduce<{ [key: string]: LLMModel }>((result, model) => {
      result[model.id] = model; // Key by model.id
      return result;
    }, {});

    set((state) => ({
      ...state,
      providerList,
      modelList: newData,
      modelListByKey: modelByKey, // Populate during initial load
    }));

  },
  initModelListRealId: async (initModels: llmModelType[]) => {
    const newData = initModels.map((model) => ({
      id: model.id, // This is the real DB ID, not the model's public 'name'
      name: model.name,
      displayName: model.displayName,
      apiUrl: model.apiUrl || undefined,
      maxTokens: model.maxTokens || undefined,
      supportVision: model.supportVision || undefined,
      selected: model.selected || false,
      provider: {
        id: model.providerId,
        providerName: model.providerName,
        providerLogo: model.providerLogo,
      }
    }));

    const providerList = Array.from(
      new Map(
        initModels.map((model) => [
          model.providerId,
          {
            id: model.providerId,
            providerName: model.providerName,
            providerLogo: model.providerLogo,
            status: true,
          }
        ])
      ).values()
    );

    set((state) => ({
      ...state,
      providerList,
      modelListRealId: newData,
    }));
  },
  initAllProviderList: async (providers: LLMModelProvider[]) => {
    const providerByKey = providers.reduce<{ [key: string]: LLMModelProvider }>((result, provider) => {
      result[provider.id] = provider;
      return result;
    }, {});

    set((state) => ({
      ...state,
      allProviderList: providers,
      allProviderListByKey: providerByKey,
    }));
  },
  setCurrentModelExact: (providerId: string, modelId: string) => {
    set((state) => {
      if (!(state.currentModel.id === modelId && state.currentModel.provider.id === providerId)) {
        // Use modelListByKey for lookup if available
        const modelInfo = get().modelListByKey?.[modelId];
        if (modelInfo && modelInfo.provider.id === providerId) { // Confirm provider matches
          return {
            ...state,
            currentModel: modelInfo,
          };
        } else {
          // Fallback to find if modelListByKey isn't robust enough or on initial load
          const fallbackModelInfo = state.modelList.find(m => (m.id === modelId && m.provider.id === providerId));
          if (fallbackModelInfo) {
            return {
              ...state,
              currentModel: fallbackModelInfo,
            };
          }
          return state;
        }
      }
      return state;
    });
  },
  setCurrentModel: (modelId: string) => {
    set((state) => {
      if (state.currentModel?.id !== modelId) {
        // Use modelListByKey for faster lookup
        const modelInfo = get().modelListByKey?.[modelId];
        if (modelInfo) {
          return {
            ...state,
            currentModel: modelInfo,
          };
        } else {
          // Fallback to find if modelListByKey isn't robust enough or on initial load
          const fallbackModelInfo = state.modelList.find(m => m.id === modelId);
          if (fallbackModelInfo) {
            return {
              ...state,
              currentModel: fallbackModelInfo,
            };
          }
          return state;
        }
      }
      return state;
    });
  },

  toggleProvider: async (providerId: string, selected: boolean) => {
    set((state) => ({
      ...state,
      allProviderList: state.allProviderList.map((item) =>
        item.id === providerId ? { ...item, status: selected } : item
      ),
    }));
  },

  addCustomProvider: async (provider: LLMModelProvider) => {
    set((state) => {
      const newAllProviderList = [...state.allProviderList, provider];
      const newAllProviderListByKey = {
        ...state.allProviderListByKey,
        [provider.id]: provider,
      };
      return {
        ...state,
        allProviderList: newAllProviderList,
        allProviderListByKey: newAllProviderListByKey,
      };
    });
  },

  renameProvider: async (providerId: string, newName: string) => {
    set((state) => {
      const newAllProviderList = state.allProviderList.map((provider) =>
        provider.id === providerId ? { ...provider, providerName: newName } : provider
      );

      const newAllProviderListByKey = {
        ...state.allProviderListByKey,
        [providerId]: {
          ...state.allProviderListByKey![providerId],
          providerName: newName,
        },
      };

      return {
        ...state,
        allProviderList: newAllProviderList,
        allProviderListByKey: newAllProviderListByKey,
      };
    });
  },

  deleteCustomProvider: async (providerId: string) => {
    set((state) => {
      const newAllProviderList = state.allProviderList.filter(
        (provider) => provider.id !== providerId
      );

      const { [providerId]: _, ...newAllProviderListByKey } = state.allProviderListByKey || {};

      return {
        ...state,
        allProviderList: newAllProviderList,
        allProviderListByKey: newAllProviderListByKey,
      };
    });
  },

  changeSelect: async (modelId: string, selected: boolean) => {
    set((state) => ({
      ...state,
      modelList: state.modelList.map((model) =>
        model.id === modelId ? { ...model, selected } : model
      ),
      modelListByKey: state.modelListByKey ? { // Update modelListByKey as well
        ...state.modelListByKey,
        [modelId]: { ...state.modelListByKey[modelId], selected }
      } : null,
    }));
  },
  addCustomModel: async (model: LLMModel) => {
    set((state) => {
      const newModelList = [...state.modelList, model];
      const newModelListByKey = {
        ...(state.modelListByKey || {}), // Ensure it's not null before spreading
        [model.id]: model,
      };
      return {
        ...state,
        modelList: newModelList,
        modelListByKey: newModelListByKey,
      };
    });
  },
  updateCustomModel: async (modelId: string, model: LLMModel) => {
    set((state) => {
      const updatedModelList = state.modelList.map((existingModel) =>
        existingModel.id === modelId ? { ...existingModel, ...model } : existingModel
      );
      const updatedModelListByKey = state.modelListByKey ? {
        ...state.modelListByKey,
        [modelId]: { ...state.modelListByKey[modelId], ...model }
      } : null;

      return {
        ...state,
        modelList: updatedModelList,
        modelListByKey: updatedModelListByKey,
      };
    });
  },

  deleteCustomModel: async (modelId: string) => {
    set((state) => {
      const newModelList = state.modelList.filter((model) => model.id !== modelId);
      const { [modelId]: _, ...newModelListByKey } = state.modelListByKey || {};

      return {
        ...state,
        modelList: newModelList,
        modelListByKey: newModelListByKey,
      };
    });
  }
}));

export default useModelListStore;
