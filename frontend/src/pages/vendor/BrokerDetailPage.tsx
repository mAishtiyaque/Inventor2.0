import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorApi } from "../../api/vendorApi";
import type { Vendor } from "../../api/vendorApi";
import { uiLoader } from "../../store/loaderStore";
import { uiAlert } from "../../store/alertStore";
import { vendorFinanceApi } from "../../api/vendorFinanceApi";
import { Link } from "react-router-dom";
import { CreateBrokerModal } from "../../components/CreateBrokerModal";

export const BrokerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [editing, setEditing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      load(id);
      loadBalance(id);
    }
  }, [id]);

  const load = async (vendorId: string) => {
    uiLoader.show();
    try {
      const res = await vendorApi.getBroker(vendorId);
      setVendor(res.data);
    } catch (e) {
      uiAlert.error("Failed to load broker");
      navigate("/vendor/brokers");
    } finally {
      uiLoader.hide();
    }
  };

  const loadBalance = async (vendorId: string) => {
    try {
      const res = await vendorFinanceApi.getBalance(vendorId);
      setBalance(res.data.balance);
    } catch (e) {
      // ignore
    }
  };

  if (!vendor) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Broker: {vendor.name}</h2>
          <p className="text-sm text-slate-500">{vendor.code}</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-right">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="text-lg font-bold">
              {balance != null ? `₹${balance.toFixed(2)}` : "—"}
            </p>
          </div>
          <Link to={`/vendor/brokers/${vendor.id}/finance`} className="btn">
            Open Ledger
          </Link>
          <button className="btn" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="btn" onClick={() => navigate("/vendor/brokers")}>
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Code
            </p>
            <p className="text-sm font-bold text-slate-900">{vendor.code}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Name
            </p>
            <p className="text-sm font-bold text-slate-900">{vendor.name}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Contact
            </p>
            <p className="text-sm text-slate-700">
              {vendor.contactName || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Phone
            </p>
            <p className="text-sm text-slate-700">{vendor.phone || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Email
            </p>
            <p className="text-sm text-slate-700">{vendor.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Status
            </p>
            <p className="text-sm text-slate-700">
              {vendor.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Address
            </p>
            <p className="text-sm text-slate-700">{vendor.address || "-"}</p>
          </div>
        </div>
      </div>

      {editing && (
        <CreateBrokerModal
          initial={vendor}
          onCancel={() => setEditing(false)}
          onSuccess={() => {
            setEditing(false);
            if (vendor) load(vendor.id);
          }}
        />
      )}
    </div>
  );
};

export default BrokerDetailPage;
