"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, LifeBuoy, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/support")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTickets(data.tickets || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            Support Desk <LifeBuoy className="w-6 h-6 text-red-500" />
          </h1>
          <p className="text-sm text-slate-500 font-medium">Manage incoming host and agency inquiries.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Tickets</h3>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700">
            <Mail className="w-4 h-4 mr-2" /> Connect Inbox
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4">Ticket ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Status / Priority</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading tickets...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No support tickets found.</td></tr>
              ) : (
                tickets.map(t => (
                  <tr key={t.ticketId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-slate-600">{t.ticketId}</td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-900">{t.userName}</p>
                      <p className="text-xs text-slate-500">{t.userEmail}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-700">{t.subject}</p>
                      <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          {t.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {t.priority}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="glass" size="sm" className="text-slate-500 hover:text-slate-900">
                        Reply <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}