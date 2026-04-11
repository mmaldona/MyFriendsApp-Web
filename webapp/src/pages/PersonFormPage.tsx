import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image, User, X, Plus } from "lucide-react";
import { useAppStore } from "../state/appStore";

type PhoneRow = { id?: string; number: string; label: string };

const PHONE_LABELS = ["Mobile", "Home", "Work", "Other"];

export default function PersonFormPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { personId } = useParams<{ personId: string }>();
  const isEdit = !!personId;

  const navigate = useNavigate();
  const people = useAppStore((s) => s.people);
  const addPerson = useAppStore((s) => s.addPerson);
  const updatePerson = useAppStore((s) => s.updatePerson);
  const addNoteToHistory = useAppStore((s) => s.addNoteToHistory);
  const addPhoneNumber = useAppStore((s) => s.addPhoneNumber);
  const editPhoneNumber = useAppStore((s) => s.editPhoneNumber);
  const deletePhoneNumber = useAppStore((s) => s.deletePhoneNumber);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const didSave = useRef(false);

  const person = isEdit ? people.find((p) => p.id === personId) : undefined;

  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [hasPartner, setHasPartner] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [note, setNote] = useState("");
  const [phoneRows, setPhoneRows] = useState<PhoneRow[]>([{ number: "", label: "Mobile" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && person) {
      setName(person.name);
      setPartnerName(person.partnerName || "");
      setHasPartner(!!person.partnerName);
      setPhotoBase64(person.photoBase64 || person.photoUri);
      setPhoneRows(
        person.phoneNumbers && person.phoneNumbers.length > 0
          ? person.phoneNumbers.map((ph) => ({ id: ph.id, number: ph.number, label: ph.label }))
          : [{ number: "", label: "Mobile" }]
      );
    }
  }, [person?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxSize = 800;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setPhotoBase64(canvas.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const cycleLabel = (index: number) => {
    setPhoneRows((rows) =>
      rows.map((row, i) => {
        if (i !== index) return row;
        const next = PHONE_LABELS[(PHONE_LABELS.indexOf(row.label) + 1) % PHONE_LABELS.length];
        return { ...row, label: next };
      })
    );
  };

  const updateRowNumber = (index: number, value: string) => {
    setPhoneRows((rows) => rows.map((row, i) => (i === index ? { ...row, number: value } : row)));
  };

  const removeRow = (index: number) => {
    setPhoneRows((rows) => rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setPhoneRows((rows) => [...rows, { number: "", label: "Mobile" }]);
  };

  const handleSave = () => {
    if (!name.trim() || didSave.current) return;
    didSave.current = true;
    setSaving(true);

    setTimeout(() => {
      if (!isEdit) {
        // Add mode
        const validPhones = phoneRows.filter((r) => r.number.trim());
        addPerson({
          name: name.trim(),
          partnerName: hasPartner && partnerName.trim() ? partnerName.trim() : undefined,
          photoBase64,
          notes: note.trim() || undefined,
          noteHistory: note.trim()
            ? [{ id: Date.now().toString() + Math.random(), content: note.trim(), timestamp: Date.now() }]
            : [],
          phoneNumbers: validPhones.map((r) => ({
            id: Date.now().toString() + Math.random(),
            number: r.number.trim(),
            label: r.label,
            timestamp: Date.now(),
          })),
          groupId: groupId!,
          deletedAt: undefined,
        });
        navigate(`/groups/${groupId}`);
      } else {
        // Edit mode
        if (!person) return;

        updatePerson(person.id, {
          name: name.trim(),
          partnerName: hasPartner && partnerName.trim() ? partnerName.trim() : undefined,
          photoBase64,
          photoUri: undefined,
        });

        const originalIds = new Set((person.phoneNumbers || []).map((ph) => ph.id));
        const currentIds = new Set(phoneRows.filter((r) => r.id).map((r) => r.id!));

        // Edit changed rows and add new rows
        for (const row of phoneRows) {
          if (row.id) {
            const original = (person.phoneNumbers || []).find((ph) => ph.id === row.id);
            if (original && (original.number !== row.number.trim() || original.label !== row.label)) {
              editPhoneNumber(person.id, row.id, row.number.trim(), row.label);
            }
          } else if (row.number.trim()) {
            addPhoneNumber(person.id, row.number.trim(), row.label);
          }
        }

        // Delete removed rows
        for (const originalId of originalIds) {
          if (!currentIds.has(originalId)) {
            deletePhoneNumber(person.id, originalId);
          }
        }

        if (note.trim()) {
          addNoteToHistory(person.id, note.trim());
        }

        navigate(`/groups/${person.groupId}`);
      }
    }, 10);
  };

  const backTarget = isEdit && person
    ? `/groups/${person.groupId}`
    : `/groups/${groupId}`;

  if (isEdit && !person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Person not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-3">
          <button
            onClick={() => navigate(backTarget)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">
            {isEdit ? "Edit Person" : "Add Person"}
          </h1>
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
                {isEdit ? "Change Photo" : "Choose Photo"}
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
              autoFocus={!isEdit}
            />
          </div>

          {/* Partner toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setHasPartner(!hasPartner)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${hasPartner ? "bg-blue-500 border-blue-500" : "border-gray-400"}`}
              >
                {hasPartner ? <span className="text-white text-xs font-bold">✓</span> : null}
              </div>
              <span className="text-sm text-gray-900">Has partner/spouse</span>
            </label>
          </div>

          {/* Partner Name */}
          {hasPartner ? (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Partner/Spouse Name</label>
              <input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Enter partner's name"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : null}

          {/* Phone Numbers */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Phone Numbers</p>
            <div className="space-y-2">
              {phoneRows.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    onClick={() => cycleLabel(index)}
                    className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors min-w-[64px] text-center"
                  >
                    {row.label}
                  </button>
                  <input
                    value={row.number}
                    onChange={(e) => updateRowNumber(index, e.target.value)}
                    placeholder="Phone number"
                    type="tel"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {(phoneRows.length > 1 || row.number.trim() !== "") ? (
                    <button
                      onClick={() => removeRow(index)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              onClick={addRow}
              className="mt-3 flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              Add Phone
            </button>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {isEdit ? "Add New Note" : "Note"}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isEdit ? "Write a note..." : "Add any notes to help you remember..."}
              rows={isEdit ? 3 : 4}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white py-4 rounded-xl text-base font-semibold transition-colors"
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Save Person"}
          </button>
        </div>
      </div>
    </div>
  );
}
