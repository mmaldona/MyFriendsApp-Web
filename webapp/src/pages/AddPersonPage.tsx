import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Camera, Image, User } from "lucide-react";
import { useAppStore } from "../state/appStore";

export default function AddPersonPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const addPerson = useAppStore((s) => s.addPerson);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [hasPartner, setHasPartner] = useState(false);
  const [notes, setNotes] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    addPerson({
      name: name.trim(),
      partnerName: hasPartner && partnerName.trim() ? partnerName.trim() : undefined,
      notes: notes.trim() || undefined,
      noteHistory: notes.trim()
        ? [{ id: Date.now().toString() + Math.random(), content: notes.trim(), timestamp: Date.now() }]
        : [],
      phoneNumbers: [],
      photoBase64,
      groupId: groupId!,
    });
    window.location.href = `/groups/${groupId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-3">
          <button onClick={() => { window.location.href = `/groups/${groupId}`; }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Add Person</h1>
        </div>

        <div className="p-6 space-y-5">
          {/* Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {photoBase64 ? (
                <img src={photoBase64} className="w-full h-full object-cover" alt="" />
              ) : (
                <User size={56} className="text-gray-400" />
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Image size={18} />
                Choose Photo
              </button>
              {photoBase64 && (
                <button
                  onClick={() => setPhotoBase64(undefined)}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Partner toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setHasPartner(!hasPartner)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${hasPartner ? "bg-blue-500 border-blue-500" : "border-gray-400"}`}
              >
                {hasPartner && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm text-gray-900">Has partner/spouse</span>
            </label>
          </div>

          {/* Partner Name */}
          {hasPartner && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Partner/Spouse Name</label>
              <input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Enter partner's name"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes to help you remember..."
              rows={4}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-xl text-base font-semibold transition-colors"
          >
            {saving ? "Saving..." : "Save Person"}
          </button>
        </div>
      </div>
    </div>
  );
}
