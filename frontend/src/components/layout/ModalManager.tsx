import React from 'react';
import { useModal } from '../../store/modalStore';
import { CreateProductModal } from '../CreateProductModal';
import { CreateProcessModal } from '../CreateProcessModal';
import { CreateRevisionModal } from '../CreateRevisionModal';

export const ModalManager: React.FC = () => {
    const { isOpen, type, data, close } = useModal();

    if (!isOpen) return null;

    switch (type) {
        case 'CREATE_PRODUCT':
            return <CreateProductModal onSuccess={close} onCancel={close} />;
        case 'CREATE_PROCESS':
            return <CreateProcessModal onSuccess={close} onCancel={close} />;
        case 'CREATE_REVISION':
            return <CreateRevisionModal
                definitionId={data?.definitionId}
                versionId={data?.versionId}
                isEditMode={data?.isEditMode}
                initialIos={data?.initialIos}
                initialCosts={data?.initialCosts}
                initialNotes={data?.initialNotes}
                setDefinition={data?.setDefinition}
                onSuccess={close}
                onCancel={close}
            />;
        case 'EDIT_PROCESS':
            return <div className="text-white p-20 bg-slate-900 rounded-3xl">Edit Mode: {data?.id}</div>; // Example of data usage
        default:
            return null;
    }
};
