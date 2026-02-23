import { useState } from "react";
import { useAdmin } from "../contexts/AdminContext";
import { useAuth } from "../contexts/AuthContext";

// ── Shared input field ────────────────────────────────────────────────────────

function Field({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition ${className}`}
    />
  );
}

// ── Categories tab ────────────────────────────────────────────────────────────

function CategoriesTab() {
  const { categories, addCategory, editCategory, deleteCategory } = useAdmin();
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) {
      setAddError("Name is required.");
      return;
    }
    const success = addCategory(newName);
    if (!success) {
      setAddError("Category already exists.");
      return;
    }
    setNewName("");
    setAddError("");
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditDraft(category.name);
  };

  const commitEdit = (id) => {
    editCategory(id, editDraft);
    setEditingId(null);
  };

  return (
    <div>
      {/* Add strip */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex gap-2">
          <Field
            value={newName}
            onChange={(v) => {
              setNewName(v);
              setAddError("");
            }}
            placeholder="New category name…"
            className="flex-1"
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold transition-colors"
          >
            + Add
          </button>
        </div>
        {addError && (
          <p className="text-xs font-semibold text-red-300 ml-1">{addError}</p>
        )}
      </div>

      {/* Category list */}
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 bg-white/5"
          >
            {editingId === category.id ? (
              <>
                <input
                  autoFocus
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(category.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/60"
                />
                <button
                  onClick={() => commitEdit(category.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-semibold text-white">
                  {category.name}
                </span>
                <button
                  onClick={() => startEditing(category)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-white/40 text-center py-8">
            No categories yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sections tab ──────────────────────────────────────────────────────────────

const EMPTY_SECTION = { title: "", filterBy: "rating", visible: true };

function SectionsTab() {
  const { sections, addSection, editSection, deleteSection } = useAdmin();
  const [form, setForm] = useState(EMPTY_SECTION);
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const isEditing = editingId !== null;

  const handleAdd = () => {
    if (!form.title.trim()) {
      setAddError("Title is required.");
      return;
    }
    const success = addSection(form);
    if (!success) {
      setAddError("Failed to add section.");
      return;
    }
    setForm(EMPTY_SECTION);
    setAddError("");
  };

  const startEditing = (section) => {
    setEditingId(section.id);
    setForm({
      title: section.title,
      filterBy: section.filterBy,
      visible: section.visible,
    });
  };

  const commitEdit = (id) => {
    editSection(id, form);
    setEditingId(null);
    setForm(EMPTY_SECTION);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_SECTION);
  };

  return (
    <div>
      {/* Add / Edit form panel */}
      <div className="flex flex-col gap-3 mb-6 p-4 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">
          {isEditing ? "Edit Section" : "New Section"}
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Field
            value={form.title}
            onChange={(v) => {
              setForm((f) => ({ ...f, title: v }));
              setAddError("");
            }}
            placeholder="Section title…"
            className="flex-1"
          />
          <Field
            value={form.filterBy}
            onChange={(v) => setForm((f) => ({ ...f, filterBy: v }))}
            placeholder="Filter (e.g. rating, year, genre:Action)"
            className="flex-1"
          />
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer select-none px-2">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) =>
                setForm((f) => ({ ...f, visible: e.target.checked }))
              }
              className="w-4 h-4 accent-blue-500"
            />
            Visible
          </label>
        </div>
        {addError && (
          <p className="text-xs font-semibold text-red-300">{addError}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => (isEditing ? commitEdit(editingId) : handleAdd())}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold transition-colors"
          >
            {isEditing ? "Save Changes" : "+ Add Section"}
          </button>
          {isEditing && (
            <button
              onClick={cancelEdit}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Section list */}
      <div className="flex flex-col gap-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              editingId === section.id
                ? "border-blue-500/30 bg-blue-500/5"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {section.title}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Filter:{" "}
                <span className="text-white/60">{section.filterBy}</span>
              </p>
            </div>
            <span
              className={`text-xs font-extrabold uppercase tracking-wider px-2 py-1 rounded-full border ${
                section.visible
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-white/5 text-white/30 border-white/10"
              }`}
            >
              {section.visible ? "Live" : "Hidden"}
            </span>
            <button
              onClick={() => startEditing(section)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => deleteSection(section.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-white/40 text-center py-8">
            No sections yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Dashboard shell ───────────────────────────────────────────────────────────

const TABS = ["Categories", "Sections"];

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Categories");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-screen-lg mx-auto px-4 md:px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-600/20 text-blue-400 border border-blue-600/30">
              Admin
            </span>
            <span className="text-white/30 text-sm">{user?.email}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-white/50 mt-1">
            Manage genres and homepage sections.
          </p>
        </header>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl border border-white/10 bg-white/5 w-fit mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === tab
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Categories" ? <CategoriesTab /> : <SectionsTab />}
      </div>
    </div>
  );
}

export default AdminDashboard;
