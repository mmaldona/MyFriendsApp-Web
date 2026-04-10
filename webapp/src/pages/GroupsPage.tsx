import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Users, Plus, Trash2, GripVertical, Pencil, X, Check } from "lucide-react";
import { useAppStore } from "../state/appStore";
import { Group } from "../types/app";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GROUP_COLORS = [
  "#FF6B6B","#E74C3C","#FFA07A","#FF8C94","#FF69B4","#E91E63",
  "#BB8FCE","#9B59B6","#8B5CF6","#6366F1","#4ECDC4","#45B7D1",
  "#85C1E2","#3B82F6","#1E90FF","#06B6D4","#14B8A6","#10B981",
  "#22C55E","#84CC16","#98D8C8","#F7DC6F","#FCD34D","#FB923C",
  "#F97316","#EF4444","#94A3B8","#64748B","#78716C","#A78BFA",
];

function SortableGroupCard({
  group,
  peopleCount,
  onPress,
  onEdit,
  onDelete,
}: {
  group: Group;
  peopleCount: number;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
    >
      {/* Drag handle */}
      <button
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>

      {/* Color dot + info — clickable */}
      <button className="flex items-center gap-4 flex-1 text-left" onClick={onPress}>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: group.color }}
        >
          <Users size={22} color="white" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{group.name}</p>
          <p className="text-sm text-gray-500">
            {peopleCount} {peopleCount === 1 ? "person" : "people"}
          </p>
        </div>
      </button>

      {/* Actions */}
      <button
        onClick={onEdit}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Pencil size={18} />
      </button>
      <button
        onClick={onDelete}
        className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function GroupsPage() {
  const navigate = useNavigate();
  const allGroups = useAppStore((s) => s.groups);
  const people = useAppStore((s) => s.people);
  const addGroup = useAppStore((s) => s.addGroup);
  const deleteGroup = useAppStore((s) => s.deleteGroup);
  const reorderGroups = useAppStore((s) => s.reorderGroups);

  const [modalOpen, setModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);

  const groups = allGroups
    .filter((g) => !g.deletedAt)
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });

  const deletedGroupsCount = allGroups.filter((g) => g.deletedAt).length;

  const getPeopleCount = (groupId: string) =>
    people.filter((p) => p.groupId === groupId && !p.deletedAt).length;

  const handleAddGroup = () => {
    if (!groupName.trim()) return;
    addGroup({ name: groupName.trim(), color: selectedColor });
    setGroupName("");
    setSelectedColor(GROUP_COLORS[0]);
    setModalOpen(false);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = groups.findIndex((g) => g.id === active.id);
    const newIndex = groups.findIndex((g) => g.id === over.id);
    const reordered = arrayMove(groups, oldIndex, newIndex).map((g, i) => ({ ...g, order: i }));
    reorderGroups(reordered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Friends</h1>
            <p className="text-sm text-gray-500 mt-0.5">Organize people by community</p>
          </div>
          {deletedGroupsCount > 0 && (
            <button
              onClick={() => navigate("/deleted-groups")}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2 transition-colors"
            >
              <Trash2 size={18} />
              <span className="font-semibold">{deletedGroupsCount}</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <Users size={64} className="text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">No Groups Yet</h2>
              <p className="text-gray-500 mt-2">Create your first group to start remembering names</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={groups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                {groups.map((group) => (
                  <SortableGroupCard
                    key={group.id}
                    group={group}
                    peopleCount={getPeopleCount(group.id)}
                    onPress={() => navigate(`/groups/${group.id}?name=${encodeURIComponent(group.name)}`)}
                    onEdit={() => navigate(`/groups/${group.id}/edit`)}
                    onDelete={() => deleteGroup(group.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors z-20"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Add Group Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">New Group</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            <label className="text-sm font-medium text-gray-700 block mb-1">Group Name</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Gym, Church, Book Club"
              className="rounded-xl"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 block mb-3">Choose Color</label>
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

          <Button
            onClick={handleAddGroup}
            disabled={!groupName.trim()}
            className="w-full mt-4 rounded-xl py-6 text-base font-semibold bg-blue-500 hover:bg-blue-600"
          >
            Create Group
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
