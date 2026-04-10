import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Phone, FileText, Plus } from "lucide-react";
import { useAppStore } from "../state/appStore";
import { formatPersonName, formatTimestamp } from "../utils/formatName";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function NoteCard({
  noteId,
  content,
  timestamp,
  onEdit,
  onDelete,
}: {
  noteId: string;
  content: string;
  timestamp: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const editNote = useAppStore((s) => s.editNote);
  const { personId } = useParams<{ personId: string }>();

  const handleSave = () => {
    if (editedContent.trim()) {
      editNote(personId!, noteId, editedContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-3 group">
      <p className="text-xs font-semibold text-gray-400 mb-2">{formatTimestamp(timestamp)}</p>
      {isEditing ? (
        <div>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full bg-white rounded-lg p-3 text-sm text-gray-900 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Save</button>
            <button onClick={() => { setIsEditing(false); setEditedContent(content); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <p className="text-sm text-gray-900 leading-relaxed flex-1">{content}</p>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => { setIsEditing(true); setEditedContent(content); }} className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PhoneCard({
  phoneId,
  number,
  label,
  onDelete,
}: {
  phoneId: string;
  number: string;
  label: string;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNumber, setEditedNumber] = useState(number);
  const [editedLabel, setEditedLabel] = useState(label);
  const editPhoneNumber = useAppStore((s) => s.editPhoneNumber);
  const { personId } = useParams<{ personId: string }>();

  const handleSave = () => {
    if (editedNumber.trim() && editedLabel.trim()) {
      editPhoneNumber(personId!, phoneId, editedNumber.trim(), editedLabel.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-3 group">
      {isEditing ? (
        <div className="space-y-2">
          <input value={editedLabel} onChange={(e) => setEditedLabel(e.target.value)} placeholder="Label" className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={editedNumber} onChange={(e) => setEditedNumber(e.target.value)} placeholder="Phone number" className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Save</button>
            <button onClick={() => { setIsEditing(false); setEditedNumber(number); setEditedLabel(label); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Phone size={16} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{number}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PersonDetailPage() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const people = useAppStore((s) => s.people);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const deletePhoneNumber = useAppStore((s) => s.deletePhoneNumber);

  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [deletePhoneId, setDeletePhoneId] = useState<string | null>(null);

  const person = people.find((p) => p.id === personId);

  if (!person) {
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
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">Details</h1>
          <button
            onClick={() => navigate(`/people/${person.id}/edit`)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>

        {/* Photo + Name */}
        <div className="bg-white border-b border-gray-100 px-6 py-8 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
            {person.photoBase64 || person.photoUri ? (
              <img src={person.photoBase64 || person.photoUri} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-gray-400 font-bold text-5xl">{person.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {formatPersonName(person.name, person.partnerName)}
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Phone Numbers */}
          {person.phoneNumbers && person.phoneNumbers.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Phone size={16} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Numbers</p>
              </div>
              {person.phoneNumbers.map((phone) => (
                <PhoneCard
                  key={phone.id}
                  phoneId={phone.id}
                  number={phone.number}
                  label={phone.label}
                  onDelete={() => setDeletePhoneId(phone.id)}
                />
              ))}
            </div>
          )}

          {/* Notes History */}
          {person.noteHistory && person.noteHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes History</p>
              </div>
              {person.noteHistory.map((note) => (
                <NoteCard
                  key={note.id}
                  noteId={note.id}
                  content={note.content}
                  timestamp={note.timestamp}
                  onEdit={() => {}}
                  onDelete={() => setDeleteNoteId(note.id)}
                />
              ))}
            </div>
          )}

          {person.phoneNumbers?.length === 0 && person.noteHistory?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plus size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500">No details yet. Tap Edit to add phone numbers and notes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Note Confirm */}
      <Dialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <DialogContent className="">
          <DialogHeader><DialogTitle>Delete Note</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this note? This action cannot be undone.</p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setDeleteNoteId(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
            <button onClick={() => { if (deleteNoteId) { deleteNote(personId!, deleteNoteId); setDeleteNoteId(null); } }} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors">Delete</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Phone Confirm */}
      <Dialog open={!!deletePhoneId} onOpenChange={() => setDeletePhoneId(null)}>
        <DialogContent className="">
          <DialogHeader><DialogTitle>Delete Phone Number</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete this phone number? This action cannot be undone.</p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setDeletePhoneId(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
            <button onClick={() => { if (deletePhoneId) { deletePhoneNumber(personId!, deletePhoneId); setDeletePhoneId(null); } }} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
