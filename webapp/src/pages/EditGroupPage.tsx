import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useAppStore } from "../state/appStore";

const GROUP_COLORS = [
  "#FF6B6B","#E74C3C","#FFA07A","#FF8C94","#FF69B4","#E91E63",
  "#BB8FCE","#9B59B6","#8B5CF6","#6366F1","#4ECDC4","#45B7D1",
  "#85C1E2","#3B82F6","#1E90FF","#06B6D4","#14B8A6","#10B981",
  "#22C55E","#84CC16","#98D8C8","#F7DC6F","#FCD34D","#FB923C",
  "#F97316","#EF4444","#94A3B8","#64748B","#78716C","#A78BFA",
];

export default function EditGroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const groups = useAppStore((s) => s.groups);
  const updateGroup = useAppStore((s) => s.updateGroup);

  const group = groups.find((g) => g.id === groupId);

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setSelectedColor(group.color);
    }
  }, [group?.id]);

  const handleSave = () => {
    if (!name.trim() || !group) return;
    updateGroup(group.id, { name: name.trim(), color: selectedColor });
    navigate(-1);
  };

  if (!group) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Group not found</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Edit Group</h1>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Save
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Group Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Choose Color</label>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color, outline: selectedColor === color ? "3px solid #111827" : "none", outlineOffset: "2px" }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                >
                  {selectedColor === color && <Check size={18} color="white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-xl text-base font-semibold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
