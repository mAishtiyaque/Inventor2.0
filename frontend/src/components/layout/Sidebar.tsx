import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  Settings2,
  Activity,
  List as ListIcon,
  Recycle,
} from "lucide-react";

const SidebarItem = ({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
        isActive
          ? "bg-slate-200 text-slate-900 border-l-[3px] border-slate-900 rounded-l-none"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon size={16} strokeWidth={2} />
      <span>{label}</span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-200 flex flex-col bg-slate-50/50 backdrop-blur-xl h-screen sticky top-0">
      <div className="h-14 flex items-center px-6 border-b border-slate-200/50">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-xs uppercase tracking-tighter">
            iP
          </div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">
            InventoryPro
          </h1>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-8 overflow-y-auto">
        <section>
          <h3 className="px-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Workspace
          </h3>
          <nav className="space-y-1">
            <SidebarItem to="/" icon={LayoutDashboard} label="Overview" />
          </nav>
        </section>

        <section>
          <h3 className="px-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Inventory
          </h3>
          <nav className="space-y-1">
            <SidebarItem
              to="/inventory/raw"
              icon={Package}
              label="Raw Materials"
            />
            <SidebarItem
              to="/inventory/products"
              icon={Layers}
              label="Products"
            />
            <SidebarItem to="/inventory/scrap" icon={Recycle} label="Scrap" />
          </nav>
        </section>

        <section>
          <h3 className="px-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Manufacturing
          </h3>
          <nav className="space-y-1">
            <SidebarItem
              to="/manufacturing/definitions"
              icon={Settings2}
              label="Definitions"
            />
            <SidebarItem
              to="/manufacturing"
              icon={Activity}
              label="Job Orders"
            />
            <SidebarItem
              to="/inventory/ledger"
              icon={ListIcon}
              label="Transaction Log"
            />
          </nav>
        </section>

        <section>
          <h3 className="px-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Network
          </h3>
          <nav className="space-y-1">
            <SidebarItem to="/vendor/brokers" icon={Users} label="Brokers" />
          </nav>
        </section>
      </div>

      <div className="mt-auto border-t border-slate-200/50 p-4">
        <div className="px-3 py-2 flex items-center justify-between group cursor-pointer hover:bg-slate-100 rounded-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm bg-slate-200 border border-slate-300 flex items-center justify-center text-[12px] font-bold text-slate-600">
              AD
            </div>
            <span className="text-xs font-semibold text-slate-700">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
