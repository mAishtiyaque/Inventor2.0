import React, { useState } from "react";
import { X } from "lucide-react";
import { vendorFinanceApi } from "../api/vendorFinanceApi";
import { uiLoader } from "../store/loaderStore";
import { uiAlert } from "../store/alertStore";

export type TransactionInitial = Partial<{
  id: string;
  transactionType: number;
  amount: number;
  currency: string;
  transactionDate: string;
  reference: string;
  notes: string;
}>;

interface Props {
  vendorId: string;
  initial?: TransactionInitial;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateTransactionModal: React.FC<Props> = ({
  vendorId,
  initial,
  onSuccess,
  onCancel,
}) => {
  const [form, setForm] = useState({
    transactionType: initial?.transactionType ?? 0,
    amount: initial?.amount ?? 0,
    currency: initial?.currency ?? "INR",
    transactionDate:
      initial?.transactionDate ?? new Date().toISOString().slice(0, 10),
    reference: initial?.reference ?? "",
    notes: initial?.notes ?? "",
  });

  const isEdit = Boolean(initial && initial.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) === 0)
      return uiAlert.warning("Amount is required");
    uiLoader.show();
    try {
      if (isEdit && initial?.id) {
        await vendorFinanceApi.updateTransaction(vendorId, initial.id, form);
        uiAlert.success("Transaction updated");
      } else {
        await vendorFinanceApi.createTransaction(vendorId, form);
        uiAlert.success("Transaction created");
      }
      onSuccess();
    } catch (err) {
      uiAlert.error("Operation failed");
    } finally {
      uiLoader.hide();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">
              {isEdit ? "Edit" : "Add"} Transaction
            </h3>
            <p className="text-sm text-slate-400">
              Record invoice, payment or adjustment.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Type
              </label>
              <select
                className="w-full px-3 py-2 border rounded-xl"
                value={form.transactionType}
                onChange={(e) =>
                  setForm({ ...form, transactionType: Number(e.target.value) })
                }
              >
                <option value={0}>Invoice</option>
                <option value={1}>Payment</option>
                <option value={2}>Adjustment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded-xl"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-xl"
              value={form.transactionDate}
              onChange={(e) =>
                setForm({ ...form, transactionDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Reference
            </label>
            <input
              className="w-full px-3 py-2 border rounded-xl"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-xl"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-100 rounded-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-slate-900 text-white rounded-2xl"
            >
              {isEdit ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransactionModal;
