import { useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Search, Plus, Grid2X2, List, SlidersHorizontal, X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useAppStore, ViewMode, SortMode } from "../state/appStore";
import { formatPersonName } from "../utils/formatName";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const h = date.getHours(); const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${h % 12 || 12}:${m.toString().padStart(2,"0")} ${ampm}`;
}

function getLastName(n: string) { const p = n.trim().split(" "); return p.length > 1 ? p[p.length - 1] : n; }
function getFirstName(n: string) { return n.trim().split(" ")[0]; }

export default function PeoplePage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams] = useSearchParams();
  const groupName = searchParams.get("name") || "Group";
  const navigate = useNavigate();

  const allPeople = useAppStore((s) => s.people);
  const allGroups = useAppStore((s) => s.groups);
  const deletePerson = useAppStore((s) => s.deletePerson);
  const updatePerson = useAppStore((s) => s.updatePerson);
  const getGroupViewPreferences = useAppStore((s) => s.getGroupViewPreferences);
  const setGroupViewPreferences = useAppStore((s) => s.setGroupViewPreferences);

  const saved = getGroupViewPreferences(groupId!);
  const [viewMode, setViewMode] = useState<ViewMode>(saved.viewMode);
  const [sortMode, setSortMode] = useState<SortMode>(saved.sortMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [moveSheetOpen, setMoveSheetOpen] = useState(false);
  const [selectedPersonToMove, setSelectedPersonToMove] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const group = allGroups.find((g) => g.id === groupId);
  const availableGroups = allGroups.filter((g) => g.id !== groupId && !g.deletedAt);

  const handleViewModeChange = (v: ViewMode) => {
    setViewMode(v);
    setGroupViewPreferences(groupId!, { viewMode: v, sortMode });
  };

  const handleSortModeChange = (s: SortMode) => {
    setSortMode(s);
    setGroupViewPreferences(groupId!, { viewMode, sortMode: s });
    setSortSheetOpen(false);
  };

  const people = useMemo(() => {
    const filtered = allPeople.filter((p) => p.groupId === groupId && !p.deletedAt);
    let result = filtered;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.partnerName?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q) ||
        p.noteHistory?.some((n) => n.content.toLowerCase().includes(q) || formatTimestamp(n.timestamp).toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => {
      if (sortMode === "firstName") return getFirstName(a.name).localeCompare(getFirstName(b.name));
      if (sortMode === "lastName") return getLastName(a.name).localeCompare(getLastName(b.name));
      return (b.lastUpdated || b.createdAt) - (a.lastUpdated || a.createdAt);
    });
  }, [allPeople, groupId, searchQuery, sortMode]);

  const handleMovePerson = (personId: string) => {
    setSelectedPersonToMove(personId);
    setMoveSheetOpen(true);
  };

  const handleMoveToGroup = (targetGroupId: string) => {
    if (selectedPersonToMove) {
      updatePerson(selectedPersonToMove, { groupId: targetGroupId });
      setMoveSheetOpen(false);
      setSelectedPersonToMove(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{groupName}</h1>
              <p className="text-sm text-gray-500">{people.length} {people.length === 1 ? "person" : "people"}</p>
            </div>
          </div>
          {/* Search + controls */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search names or notes..."
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleViewModeChange(viewMode === "list" ? "grid" : "list")}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
            >
              {viewMode === "list" ? <Grid2X2 size={20} /> : <List size={20} />}
            </button>
            <button
              onClick={() => setSortSheetOpen(true)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* People list/grid */}
        <div className="p-4">
          {people.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search size={64} className="text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">{searchQuery ? "No Results Found" : "No People Yet"}</h2>
              <p className="text-gray-500 mt-2 text-sm">{searchQuery ? "Try a different search term" : "Add people to this group"}</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-2">
              {people.map((person) => (
                <div key={person.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <button onClick={() => navigate(`/people/${person.id}`)} className="flex items-center gap-3 flex-1 text-left">
                      <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {person.photoBase64 || person.photoUri ? (
                          <img src={person.photoBase64 || person.photoUri} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-gray-500 font-semibold text-sm">
                            {person.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{formatPersonName(person.name, person.partnerName)}</p>
                        {person.noteHistory?.length > 0 && (
                          <p className="text-sm text-gray-500 truncate">{person.noteHistory[0].content}</p>
                        )}
                      </div>
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMovePerson(person.id)}
                        className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Move to group"
                      >
                        <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(person.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {people.map((person) => (
                <button
                  key={person.id}
                  onClick={() => navigate(`/people/${person.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mx-auto mb-3">
                    {person.photoBase64 || person.photoUri ? (
                      <img src={person.photoBase64 || person.photoUri} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-gray-500 font-bold text-xl">{person.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {formatPersonName(person.name, person.partnerName)}
                  </p>
                  {person.noteHistory?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{person.noteHistory[0].content}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => navigate(`/groups/${groupId}/add`)}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors z-20"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Sort Sheet */}
      <Sheet open={sortSheetOpen} onOpenChange={setSortSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-2xl font-bold">Sort By</SheetTitle>
          </SheetHeader>
          {(["firstName", "lastName", "lastUpdate"] as SortMode[]).map((mode) => {
            const labels = { firstName: "First Name", lastName: "Last Name", lastUpdate: "Last Update" };
            const colors = { firstName: "bg-blue-100 text-blue-500", lastName: "bg-purple-100 text-purple-500", lastUpdate: "bg-green-100 text-green-500" };
            return (
              <button
                key={mode}
                onClick={() => handleSortModeChange(mode)}
                className="flex items-center gap-4 w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl mb-3 transition-colors"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${colors[mode]}`}>
                  <Check size={20} />
                </div>
                <span className="flex-1 text-left text-lg font-semibold text-gray-900">{labels[mode]}</span>
                {sortMode === mode && <Check size={20} className="text-blue-500" />}
              </button>
            );
          })}
        </SheetContent>
      </Sheet>

      {/* Move Person Sheet */}
      <Sheet open={moveSheetOpen} onOpenChange={setMoveSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-2xl font-bold">Move to Group</SheetTitle>
          </SheetHeader>
          {availableGroups.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No other groups available</p>
          ) : (
            availableGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => handleMoveToGroup(g.id)}
                className="flex items-center gap-4 w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl mb-3 transition-colors"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: g.color }}>
                  <span className="text-white font-bold text-sm">{g.name.charAt(0)}</span>
                </div>
                <span className="flex-1 text-left text-lg font-semibold text-gray-900">{g.name}</span>
                <ArrowRight size={20} className="text-gray-400" />
              </button>
            ))
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Person</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this person? This action cannot be undone.</p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
            <button onClick={() => { if (deleteConfirmId) { deletePerson(deleteConfirmId); setDeleteConfirmId(null); } }} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
