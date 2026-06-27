import React, { useState } from "react";
import { vendorApi } from "../api/vendorApi";
import { uiAlert } from "../store/alertStore";
import { uiLoader } from "../store/loaderStore";
import { X } from "lucide-react";

interface CreateBrokerModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  initial?: Partial<{
    id: string;
    code: string;
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
    isActive: boolean;
  }>;
}

export const CreateBrokerModal: React.FC<CreateBrokerModalProps> = ({
  onSuccess,
  onCancel,
  initial,
}) => {
  const [form, setForm] = useState({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    contactName: initial?.contactName ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    isActive: initial?.isActive ?? true,
  });

  const isEdit = Boolean(initial && initial.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name)
      return uiAlert.warning("Code and Name are required");
    uiLoader.show();
    try {
      if (isEdit && initial?.id) {
        await vendorApi.updateBroker(initial.id, form as any);
        uiAlert.success("Broker updated");
      } else {
        await vendorApi.createBroker(form as any);
        uiAlert.success("Broker created");
      }
      onSuccess();
    } catch (err) {
      uiAlert.error(
        isEdit ? "Failed to update broker" : "Failed to create broker",
      );
    } finally {
      uiLoader.hide();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEdit ? "Edit Broker" : "Create Broker"}
            </h3>
            <p className="text-sm text-slate-400">
              {isEdit ? "Update vendor details." : "Add a new vendor / broker."}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Code
              </label>
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Name
              </label>
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Contact Person
              </label>
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Phone
              </label>
              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Address
            </label>
            <input
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-sm shadow-xl"
            >
              {isEdit ? "Save Broker" : "Create Broker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBrokerModal;
