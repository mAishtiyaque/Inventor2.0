import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { vendorApi } from "../../api/vendorApi";
import type { Vendor } from "../../api/vendorApi";
import { uiLoader } from "../../store/loaderStore";
import { uiAlert } from "../../store/alertStore";
import { ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";
import { CreateBrokerModal } from "../../components/CreateBrokerModal";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useConfirm } from "../../hooks/useConfirm";

export const BrokersPage: React.FC = () => {
  const [brokers, setBrokers] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Vendor | null>(null);
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    uiLoader.show();
    try {
      const res = await vendorApi.getBrokers();
      setBrokers(res.data);
      // fetch balances for visible brokers
      try {
        const ids = res.data.map((b) => b.id);
        const promises = ids.map((id) =>
          import("../../api/vendorFinanceApi").then((m) =>
            m.vendorFinanceApi.getBalance(id),
          ),
        );
        const results = await Promise.allSettled(promises);
        const map: Record<string, number> = {};
        results.forEach((r, idx) => {
          if (r.status === "fulfilled") {
            map[ids[idx]] = r.value.data.balance;
          }
        });
        setBalances(map);
      } catch {
        // ignore balance errors
      }
    } catch (e) {
      uiAlert.error("Failed to load brokers");
    } finally {
      uiLoader.hide();
    }
  };

  const filtered = brokers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()),
  );

  const remove = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Broker",
      message:
        "Are you sure you want to delete this broker? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    uiLoader.show();
    try {
      await vendorApi.deleteBroker(id);
      await load();
      uiAlert.success("Deleted");
    } catch {
      uiAlert.error("Delete failed");
    } finally {
      uiLoader.hide();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Brokers
          </h2>
          <p className="text-slate-500 font-medium">
            Manage vendors and brokers for external manufacturing.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
        >
          <Plus size={16} /> Create Broker
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs transition-all focus-within:max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/5 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Broker
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Type
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Contact
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Phone
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 mb-2">
                        <ExternalLink size={32} />
                      </div>
                      <p className="text-slate-900 font-bold">
                        No brokers found
                      </p>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto">
                        Create brokers to assign external work and suppliers.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/vendor/brokers/${b.id}`)}
                    className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-bold">
                          {(() => {
                            const name = b.name || b.code || "";
                            const parts = name.trim().split(/\s+/);
                            const initials =
                              parts.length === 1
                                ? parts[0].slice(0, 2)
                                : (parts[0][0] || "") + (parts[1][0] || "");
                            return initials.toUpperCase();
                          })()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                            {b.name}
                          </p>
                          <div className="flex items-center gap-3">
                            <p className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {b.code}
                            </p>
                            <p className="text-xs text-slate-500">
                              {balances[b.id] != null
                                ? `₹${balances[b.id].toFixed(2)}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black border tracking-wider",
                          "bg-amber-50 text-amber-700 border-amber-100",
                        )}
                      >
                        {b.vendorType}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {b.contactName || "-"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {b.phone || "-"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {b.isActive ? "Active" : "Inactive"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBroker(b);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                          title="Edit broker"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(b.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-red-100 transition-all"
                          title="Delete broker"
                        >
                          <Trash2 size={16} />
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

      {isCreating && (
        <CreateBrokerModal
          onCancel={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false);
            load();
          }}
        />
      )}
      {editingBroker && (
        <CreateBrokerModal
          initial={editingBroker}
          onCancel={() => setEditingBroker(null)}
          onSuccess={() => {
            setEditingBroker(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default BrokersPage;
