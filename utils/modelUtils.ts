
export interface ModelWithLabel {
    modelId: string;
    modelName: string;
    label?: {
        label?: string | null;
    } | null;
    provider?: {
        providerName?: string | null;
        showLabel?: boolean | null;
    } | null;
}

export const getModelDisplayName = (model: ModelWithLabel): string => {
    if (model.label?.label && model.provider?.providerName) {
        if (model.provider?.showLabel) {
            return `${model.label.label} - ${model.provider.providerName}`;
        }
        return model.label.label;
    }

    return model.modelName || model.modelId;
};
