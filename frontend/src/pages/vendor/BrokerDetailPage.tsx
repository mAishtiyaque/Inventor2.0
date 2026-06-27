import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { vendorApi } from "../../api/vendorApi";
import type { Vendor } from "../../api/vendorApi";
import { uiLoader } from "../../store/loaderStore";
import { uiAlert } from "../../store/alertStore";
import { vendorFinanceApi } from "../../api/vendorFinanceApi";
import type { VendorTransaction } from "../../api/vendorFinanceApi";
import { manufacturingApi } from "../../api/manufacturingApi";
import type { ProcessExecution, ExecutionStatus } from "../../api/manufacturingApi";
import { CreateBrokerModal } from "../../components/CreateBrokerModal";
import { CreateTransactionModal } from "../../components/CreateTransactionModal";
import { useConfirm } from "../../hooks/useConfirm";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Coins,
  User,
  Mail,
  Phone,
  MapPin,
  Activity,
  Hash,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../lib/utils";

export const BrokerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [editing, setEditing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<VendorTransaction[]>([]);
  const [executions, setExecutions] = useState<ProcessExecution[]>([]);
  const [showAddTx, setShowAddTx] = useState(false);
  const [editingTx, setEditingTx] = useState<VendorTransaction | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (vendorId: string) => {
    uiLoader.show();
    try {
      const [vendorRes, balRes, txRes, execRes] = await Promise.all([
        vendorApi.getBroker(vendorId),
        vendorFinanceApi.getBalance(vendorId),
        vendorFinanceApi.getTransactions(vendorId),
        manufacturingApi.getExecutions(),
      ]);
      setVendor(vendorRes.data);
      setBalance(balRes.data.balance);
      setTransactions(txRes.data);
      
      const filtered = execRes.data.filter((e) => e.vendorId === vendorId);
      setExecutions(filtered);
    } catch (e) {
      uiAlert.error("Failed to load broker details");
      navigate("/vendor/brokers");
    } finally {
      uiLoader.hide();
    }
  };

  const loadBalanceAndTx = async (vendorId: string) => {
    try {
      const [balRes, txRes, execRes] = await Promise.all([
        vendorFinanceApi.getBalance(vendorId),
        vendorFinanceApi.getTransactions(vendorId),
        manufacturingApi.getExecutions(),
      ]);
      setBalance(balRes.data.balance);
      setTransactions(txRes.data);
      
      const filtered = execRes.data.filter((e) => e.vendorId === vendorId);
      setExecutions(filtered);
    } catch (e) {
      // ignore
    }
  };

  const handleTxDelete = async (txId: string) => {
    if (!id) return;
    const confirmed = await confirm({
      title: "Delete Transaction",
      message:
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    uiLoader.show();
    try {
      await vendorFinanceApi.deleteTransaction(id, txId);
      uiAlert.success("Transaction deleted successfully");
      loadBalanceAndTx(id);
    } catch {
      uiAlert.error("Failed to delete transaction");
    } finally {
      uiLoader.hide();
    }
  };

  const getExecutionStatusBadge = (status: ExecutionStatus) => {
    switch (status) {
      case 0:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-slate-50 text-slate-500 border-slate-100 uppercase tracking-wider">
            Draft
          </span>
        );
      case 1:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-wider">
            Planned
          </span>
        );
      case 2:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-purple-50 text-purple-600 border-purple-100 uppercase tracking-wider">
            Reserved
          </span>
        );
      case 3:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-amber-50 text-amber-600 border-amber-100 uppercase tracking-wider">
            In Progress
          </span>
        );
      case 4:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-wider">
            Completed
          </span>
        );
      case 5:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-slate-100 text-slate-700 border-slate-200 uppercase tracking-wider">
            Closed
          </span>
        );
      case 6:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-red-50 text-red-600 border-red-100 uppercase tracking-wider">
            Cancelled
          </span>
        );
      case 7:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-rose-50 text-rose-600 border-rose-100 uppercase tracking-wider">
            Failed
          </span>
        );
      case 8:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-orange-50 text-orange-600 border-orange-100 uppercase tracking-wider">
            Loss
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black border bg-slate-50 text-slate-500 border-slate-100 uppercase tracking-wider">
            Unknown
          </span>
        );
    }
  };

  if (!vendor) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/vendor/brokers"
            className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Broker: {vendor.name}
              </h2>
              <span
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                  vendor.isActive
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-slate-100 text-slate-500 border-slate-200",
                )}
              >
                {vendor.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm">
              Manage details and financial records for {vendor.name}.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <Edit2 size={14} /> Edit Broker
          </button>
          <button
            onClick={() => navigate("/vendor/brokers")}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
          >
            Back
          </button>
        </div>
      </div>

      {/* Profile Details and Balance Card Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Info Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <User size={18} className="text-slate-400" />
            Broker Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
                <Hash size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Broker Code
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {vendor.code}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
                <User size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Contact Person
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {vendor.contactName || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Phone Number
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {vendor.phone || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Email Address
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 break-all">
                  {vendor.email || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Physical Address
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {vendor.address || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Balance Highlight Card */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between min-h-[220px] group">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                Outstanding Balance
              </span>
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/20 text-indigo-300">
                <Coins size={18} />
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-4xl font-black tracking-tight text-white">
                {balance != null
                  ? `₹${balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "—"}
              </h4>
              <p className="text-indigo-200/60 text-xs mt-2 font-medium">
                Current outstanding financial balance.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Coins size={160} />
          </div>
        </div>
      </div>

      {/* Processing Job Orders (Processing Transactions) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" />
              Processing Job Orders
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manufacturing job runs assigned to this broker.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 text-center">
                  Job ID
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Process Definition
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Planned Qty
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Output Qty
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Total Cost
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {executions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-16 text-center text-slate-400 font-medium"
                  >
                    No processing job orders assigned to this broker.
                  </td>
                </tr>
              ) : (
                executions.map((exec) => (
                  <tr
                    key={exec.id}
                    onClick={() => navigate(`/manufacturing/executions/${exec.id}`)}
                    className="group hover:bg-slate-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-4 text-center">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                        #{exec.id.split("-")[0].toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-slate-900">
                        {exec.processDefinitionVersion?.processDefinition?.name || "Standard Process"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Version {exec.processDefinitionVersion?.versionNumber || "1"}
                      </p>
                    </td>
                    <td className="px-8 py-4 text-center">
                      {getExecutionStatusBadge(exec.status)}
                    </td>
                    <td className="px-8 py-4 text-right text-sm font-semibold text-slate-600">
                      {exec.plannedQty}
                    </td>
                    <td className="px-8 py-4 text-right text-sm font-black text-slate-900">
                      {exec.status === 4 ? exec.actualOutputQty : "—"}
                    </td>
                    <td className="px-8 py-4 text-right text-sm font-black text-slate-900">
                      {exec.totalCost > 0 ? `₹${exec.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/manufacturing/executions/${exec.id}`);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Ledger Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-slate-400" />
              Finance Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Transactions, payments, and invoices for this broker.
            </p>
          </div>
          <button
            onClick={() => setShowAddTx(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
          >
            <Plus size={14} /> Add Transaction
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Type
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Amount
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Reference
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Notes
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-16 text-center text-slate-400 font-medium"
                  >
                    No transactions recorded for this broker.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/40 transition-colors"
                  >
                    <td className="px-8 py-4 text-sm font-semibold text-slate-700">
                      {new Date(tx.transactionDate).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-lg text-[9px] font-black border tracking-wider uppercase",
                          tx.transactionType === 0
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : tx.transactionType === 1
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-100",
                        )}
                      >
                        {tx.transactionType === 0
                          ? "Invoice"
                          : tx.transactionType === 1
                            ? "Payment"
                            : "Adjustment"}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right font-black text-slate-900 text-sm">
                      ₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500 font-mono">
                      {tx.reference || "—"}
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {tx.notes || "—"}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingTx(tx)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit transaction"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleTxDelete(tx.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editing && (
        <CreateBrokerModal
          initial={vendor}
          onCancel={() => setEditing(false)}
          onSuccess={() => {
            setEditing(false);
            if (id) loadData(id);
          }}
        />
      )}

      {showAddTx && id && (
        <CreateTransactionModal
          vendorId={id}
          onCancel={() => setShowAddTx(false)}
          onSuccess={() => {
            setShowAddTx(false);
            loadBalanceAndTx(id);
          }}
        />
      )}

      {editingTx && id && (
        <CreateTransactionModal
          vendorId={id}
          initial={editingTx}
          onCancel={() => setEditingTx(null)}
          onSuccess={() => {
            setEditingTx(null);
            loadBalanceAndTx(id);
          }}
        />
      )}
    </div>
  );
};

export default BrokerDetailPage;
