"use client";
import { useEffect, useState } from "react";
import { BookOpen, Trash2, Plus, Loader2, ListOrdered, X, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FirstAidStep {
  id: string;
  step: number;
  instruction: string;
}

interface Illness {
  id: string;
  name: string;
  description: string;
  category: string;
  firstAids: FirstAidStep[];
}

export default function AdminFirstAidPage() {
  const [guides, setGuides] = useState<Illness[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    category: "general", 
    steps: [""] 
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("/api/admin/auth");
      if (!res.ok) {
        router.push("/admin/login");
        return;
      }
      fetchGuides();
    } catch (err) {
      router.push("/admin/login");
    }
  }

  async function fetchGuides() {
    try {
      const res = await fetch("/api/admin/first-aid");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGuides(data.illnesses || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load guides");
    } finally {
      setLoading(false);
    }
  }

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addStepField = () => {
    setFormData({ ...formData, steps: [...formData.steps, ""] });
  };

  const removeStepField = (index: number) => {
    if (formData.steps.length === 1) return;
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const payload = editingId ? { id: editingId, ...formData } : formData;

    try {
      const res = await fetch("/api/admin/first-aid", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (editingId) {
        setGuides(guides.map(g => g.id === editingId ? data.illness : g));
        toast.success("Guide updated successfully");
      } else {
        setGuides([data.illness, ...guides]);
        toast.success("New guide added successfully");
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: "", description: "", category: "general", steps: [""] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this guide and all its instructions?")) return;
    try {
      const res = await fetch(`/api/admin/first-aid?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setGuides(guides.filter((g) => g.id !== id));
      toast.success("Guide removed successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function startEdit(guide: Illness) {
    setEditingId(guide.id);
    setFormData({
      name: guide.name,
      description: guide.description,
      category: guide.category,
      steps: guide.firstAids.sort((a,b) => a.step - b.step).map(s => s.instruction)
    });
    setIsAdding(false);
  }

  if (loading) {
    return <div className="page-container flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-[var(--primary-light)]" size={48} /></div>;
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Link href="/admin" style={{ color: "var(--text-muted)", fontSize: "14px", textDecoration: "none", marginBottom: "8px", display: "inline-block" }}>
              ← Back to Admin Panel
            </Link>
            <h1 className="page-title" style={{ fontSize: "28px", marginBottom: "4px" }}>First Aid Management</h1>
          </div>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              if (!isAdding) setFormData({ name: "", description: "", category: "general", steps: [""] });
            }} 
            className={isAdding ? "btn-secondary" : "btn-primary"} 
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {isAdding ? "Cancel" : <><Plus size={18} /> Add Guide</>}
          </button>
        </div>

        {/* Add / Edit Form matching Screenshot */}
        {(isAdding || editingId) && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "32px", border: `1px solid ${editingId ? 'var(--moderate)' : 'var(--primary-light)'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px" }}>{editingId ? "Edit First Aid Guide" : "Create New First Aid Guide"}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                <div>
                  <label className="form-label">Condition Name</label>
                  <input required className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Heat Stroke" />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="general">General</option>
                    <option value="injuries">Injuries</option>
                    <option value="respiratory">Respiratory</option>
                    <option value="digestive">Digestive</option>
                    <option value="allergies">Allergies</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Short Description</label>
                <textarea required className="form-input" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Key indicators and overview..." />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="form-label" style={{ margin: 0 }}>Action Steps (Numbered sequentially)</label>
                  <button type="button" onClick={addStepField} style={{ background: "none", border: "none", color: "var(--primary-light)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                    + Add Step
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {formData.steps.map((st, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", minWidth: "20px" }}>#{i + 1}</span>
                      <input 
                        required 
                        className="form-input" 
                        value={st} 
                        onChange={(e) => handleStepChange(i, e.target.value)} 
                        placeholder={`Step ${i + 1} instruction...`} 
                      />
                      {formData.steps.length > 1 && (
                        <button type="button" onClick={() => removeStepField(i)} style={{ background: "none", border: "none", color: "#EF476F", cursor: "pointer", padding: "4px" }}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: editingId ? 'var(--moderate)' : 'var(--primary-light)', color: editingId ? '#000' : '#fff' }}>
                  {editingId ? "Update Guide" : "Publish Guide"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Guides List matching Screenshot */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {guides.map((g) => {
            const isExpanded = expandedId === g.id;
            return (
              <div key={g.id} className="glass-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{g.name}</h3>
                      <span style={{ fontSize: "11px", background: "rgba(255, 209, 102, 0.15)", color: "var(--moderate)", padding: "2px 8px", borderRadius: "4px", textTransform: "capitalize" }}>
                        {g.category}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{g.description}</p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : g.id)}
                      className="btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "12px", gap: "4px" }}
                    >
                      {g.firstAids.length} Steps {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button 
                      onClick={() => startEdit(g)}
                      style={{ background: "rgba(255, 209, 102, 0.1)", border: "none", padding: "6px", borderRadius: "6px", color: "var(--moderate)", cursor: "pointer" }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(g.id)}
                      style={{ background: "rgba(239, 71, 111, 0.1)", border: "none", padding: "6px", borderRadius: "6px", color: "#EF476F", cursor: "pointer" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {g.firstAids.sort((a,b) => a.step - b.step).map((st) => (
                      <div key={st.id} style={{ display: "flex", gap: "10px", fontSize: "13px" }}>
                        <span style={{ color: "var(--primary-light)", fontWeight: 700 }}>Step {st.step}:</span>
                        <span style={{ color: "var(--text-light)" }}>{st.instruction}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {guides.length === 0 && (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              No first aid guides found. Click &quot;Add Guide&quot; to publish one.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
