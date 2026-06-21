import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  vendorFinanceApi,
  type VendorTransaction,
} from "../../api/vendorFinanceApi";
import { uiLoader } from "../../store/loaderStore";
import { uiAlert } from "../../store/alertStore";
import { Plus, Trash2, Edit2 } from "lucide-react";
import CreateTransactionModal from "../../components/CreateTransactionModal";

export const VendorFinancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<VendorTransaction[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<VendorTransaction | null>(null);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    if (!id) return;
    uiLoader.show();
    try {
      const [balRes, txRes] = await Promise.all([
        vendorFinanceApi.getBalance(id),
        vendorFinanceApi.getTransactions(id),
      ]);
      setBalance(balRes.data.balance);
      setTransactions(txRes.data);
    } catch (e) {
      uiAlert.error("Failed to load finance data");
    } finally {
      uiLoader.hide();
    }
  };

  const remove = async (txId: string) => {
    if (!id) return;
    uiLoader.show();
    try {
      await vendorFinanceApi.deleteTransaction(id, txId);
      uiAlert.success("Deleted");
      load();
    } catch {
      uiAlert.error("Delete failed");
    } finally {
      uiLoader.hide();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Finance Ledger</h2>
          <p className="text-sm text-slate-500">
            Vendor transactions and balance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-xl font-bold">
              {balance != null ? `₹${balance.toFixed(2)}` : "—"}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl"
          >
            {" "}
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50 text-xs text-slate-400">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Notes</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50">
                <td className="px-6 py-3">
                  {new Date(tx.transactionDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  {tx.transactionType === 0
                    ? "Invoice"
                    : tx.transactionType === 1
                      ? "Payment"
                      : "Adjustment"}
                </td>
                <td className="px-6 py-3 text-right">
                  ₹{tx.amount.toFixed(2)}
                </td>
                <td className="px-6 py-3">{tx.reference || "-"}</td>
                <td className="px-6 py-3">{tx.notes || "-"}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditing(tx)}
                      className="p-2 text-slate-400 hover:text-slate-900"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => remove(tx.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && id && (
        <CreateTransactionModal
          vendorId={id}
          onCancel={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}

      {editing && id && (
        <CreateTransactionModal
          vendorId={id}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default VendorFinancePage;
