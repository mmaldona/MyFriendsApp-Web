import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image, User, Plus } from "lucide-react";
import { useAppStore } from "../state/appStore";

const PHONE_LABELS = ["Mobile", "Home", "Work", "Other"];

export default function EditPersonPage() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const people = useAppStore((s) => s.people);
  const updatePerson = useAppStore((s) => s.updatePerson);
  const addNoteToHistory = useAppStore((s) => s.addNoteToHistory);
  const addPhoneNumber = useAppStore((s) => s.addPhoneNumber);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const person = people.find((p) => p.id === personId);

  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [hasPartner, setHasPartner] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [newNote, setNewNote] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneLabel, setPhoneLabel] = useState("Mobile");
  const [customLabel, setCustomLabel] = useState("");

  useEffect(() => {
    if (person) {
      setName(person.name);
      setPartnerName(person.partnerName || "");
      setHasPartner(!!person.partnerName);
      setPhotoBase64(person.photoBase64 || person.photoUri);
    }
  }, [person?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim() || !person) return;
    updatePerson(person.id, {
      name: name.trim(),
      partnerName: hasPartner && partnerName.trim() ? partnerName.trim() : undefined,
      photoBase64,
    });
    if (newNote.trim()) {
      addNoteToHistory(person.id, newNote.trim());
    }
    if (phoneNumber.trim()) {
      const label = phoneLabel === "Other" && customLabel.trim() ? customLabel.trim() : phoneLabel;
      addPhoneNumber(person.id, phoneNumber.trim(), label);
    }
    navigate(-1);
  };

  if (!person) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Person not found</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Edit Person</h1>
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
                Change Photo
              </button>
              {photoBase64 && (
                <button onClick={() => setPhotoBase64(undefined)} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
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

          {/* Add Phone Number */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus size={16} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Add Phone Number</p>
            </div>
            <div className="flex gap-2 mb-2">
              {PHONE_LABELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setPhoneLabel(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${phoneLabel === l ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            {phoneLabel === "Other" && (
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Custom label"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
            )}
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              type="tel"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Note */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus size={16} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Add New Note</p>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
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
