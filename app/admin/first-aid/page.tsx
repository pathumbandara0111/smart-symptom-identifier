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
      setGuides(data.illnesses);
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
        toast.success("Guide updated");
      } else {
        setGuides([...guides, data.illness]);
        toast.success("New guide added");
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: "", description: "", category: "general", steps: [""] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this guide?")) return;
    try {
      const res = await fetch(`/api/admin/first-aid?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setGuides(guides.filter((g) => g.id !== id));
      toast.success("Guide removed");
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
      steps: guide.firstAids.map(s => s.instruction)
    });
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              ← Back to Dashboard
            </Link>
            <h1 className="page-title" style={{ fontSize: "28px", marginBottom: "4px" }}>Manage First Aid Guides</h1>
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
            {isAdding ? "Cancel" : <><Plus size={18} /> Add New Guide</>}
          </button>
        </div>

        {(isAdding || editingId) && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "32px", border: `1px solid ${editingId ? 'var(--warning)' : 'var(--primary-light)'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px" }}>{editingId ? "Edit First Aid Guide" : "Create New First Aid Guide"}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Guide Title (Illness Name)</label>
                  <input required className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Minor Burns, Heat Stroke" />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select required className="form-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="general">General</option>
                    <option value="respiratory">Respiratory</option>
                    <option value="digestive">Digestive</option>
                    <option value="injuries">Injuries</option>
                    <option value="allergies">Allergies</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Short Description</label>
                  <textarea required className="form-input" style={{ minHeight: "80px" }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe this condition briefly..." />
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Step-by-Step Instructions</label>
                  <button type="button" onClick={addStepField} className="text-[var(--primary-light)] flex items-center gap-1 text-sm font-semibold">
                    <Plus size={14} /> Add Step
                  </button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {formData.steps.map((step, index) => (
                    <div key={index} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{ background: "rgba(255,255,255,0.1)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0, marginTop: "4px" }}>
                        {index + 1}
                      </div>
                      <textarea 
                        required 
                        className="form-input" 
                        style={{ minHeight: "60px" }} 
                        value={step} 
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        placeholder={`Instruction for step ${index + 1}...`}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeStepField(index)}
                        style={{ background: "rgba(239, 71, 111, 0.1)", border: "none", padding: "8px", borderRadius: "8px", color: "#EF476F", cursor: "pointer", marginTop: "4px" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: editingId ? 'var(--warning)' : 'var(--primary-light)', borderColor: editingId ? 'var(--warning)' : 'var(--primary-light)' }}>
                  {editingId ? "Update Guide" : "Create Guide"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {guides.map((g) => (
            <div key={g.id} className="glass-card" style={{ padding: 0, overflow: "hidden", border: editingId === g.id ? '2px solid var(--warning)' : '1px solid var(--glass-border)' }}>
              <div 
                style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: expandedId === g.id ? "rgba(255,255,255,0.03)" : "transparent" }}
                onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ background: "rgba(255, 209, 102, 0.1)", padding: "10px", borderRadius: "10px", color: "var(--warning)" }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{g.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "10px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                        {g.category}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--primary-light)" }}>
                        {g.firstAids.length} Steps
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); startEdit(g); }}
                    style={{ background: "rgba(255, 209, 102, 0.1)", border: "none", padding: "8px", borderRadius: "8px", color: "var(--warning)", cursor: "pointer" }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(g.id); }}
                    style={{ background: "rgba(239, 71, 111, 0.1)", border: "none", padding: "8px", borderRadius: "8px", color: "#EF476F", cursor: "pointer" }}
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedId === g.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              
              {expandedId === g.id && (
                <div style={{ padding: "0 20px 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ margin: "16px 0", color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>{g.description}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {g.firstAids.map((s) => (
                      <div key={s.id} style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                        <span style={{ color: "var(--primary-light)", fontWeight: 700 }}>Step {s.step}:</span>
                        <span style={{ color: "var(--text-light)" }}>{s.instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {guides.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <BookOpen size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
              <p>No first aid guides created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
