import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Trash2, Users } from "lucide-react";
import { useAppStore } from "../state/appStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function timeLeft(deletedAt: number): string {
  const remaining = THIRTY_DAYS_MS - (Date.now() - deletedAt);
  const days = Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  return `${days} day${days !== 1 ? "s" : ""} left`;
}

export default function DeletedGroupsPage() {
  const navigate = useNavigate();
  const allGroups = useAppStore((s) => s.groups);
  const people = useAppStore((s) => s.people);
  const restoreGroup = useAppStore((s) => s.restoreGroup);
  const permanentlyDeleteGroup = useAppStore((s) => s.permanentlyDeleteGroup);
  const cleanupExpiredDeletions = useAppStore((s) => s.cleanupExpiredDeletions);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    cleanupExpiredDeletions();
  }, []);

  const deletedGroups = allGroups
    .filter((g) => g.deletedAt)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));

  const getPeopleCount = (groupId: string) =>
    people.filter((p) => p.groupId === groupId && p.deletedAt).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Deleted Groups</h1>
        </div>

        <div className="p-4">
          {deletedGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Trash2 size={64} className="text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">No Deleted Groups</h2>
              <p className="text-gray-500 mt-2 text-sm">Deleted groups appear here for 30 days before being removed permanently.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-4 text-center">Groups are permanently deleted after 30 days</p>
              {deletedGroups.map((group) => (
                <div key={group.id} className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 opacity-60"
                      style={{ backgroundColor: group.color }}
                    >
                      <Users size={22} color="white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{group.name}</p>
                      <p className="text-sm text-gray-500">
                        {getPeopleCount(group.id)} {getPeopleCount(group.id) === 1 ? "person" : "people"} · {timeLeft(group.deletedAt!)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => restoreGroup(group.id)}
                        className="flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <RotateCcw size={15} />
                        Restore
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(group.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-500 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader><DialogTitle>Permanently Delete Group</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">This will permanently delete the group and all its people. This cannot be undone.</p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
            <button onClick={() => { if (confirmDeleteId) { permanentlyDeleteGroup(confirmDeleteId); setConfirmDeleteId(null); } }} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors">Delete Forever</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
