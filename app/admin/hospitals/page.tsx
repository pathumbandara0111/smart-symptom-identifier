"use client";
import { useEffect, useState } from "react";
import { Hospital as HospitalIcon, Trash2, Plus, Loader2, MapPin, Phone, Edit2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface HospitalData {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  type: string;
  doctors?: any[];
}

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", address: "", lat: "", lng: "", phone: "", type: "General" });

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
      fetchHospitals();
    } catch (err) {
      router.push("/admin/login");
    }
  }

  async function fetchHospitals() {
    try {
      const res = await fetch("/api/hospitals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHospitals(data.hospitals || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this hospital? This will also remove any doctor assigned to it.")) return;
    try {
      const res = await fetch(`/api/hospitals?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setHospitals(hospitals.filter((h) => h.id !== id));
      toast.success("Hospital deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const reqBody = { ...formData, lat: parseFloat(formData.lat) || 6.9271, lng: parseFloat(formData.lng) || 79.8612 };
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setHospitals([data.hospital, ...hospitals]);
      setIsAdding(false);
      setFormData({ name: "", address: "", lat: "", lng: "", phone: "", type: "General" });
      toast.success("Hospital added successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const reqBody = { id: editingId, ...formData, lat: parseFloat(formData.lat) || 6.9271, lng: parseFloat(formData.lng) || 79.8612 };
      const res = await fetch("/api/hospitals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setHospitals(hospitals.map((h) => (h.id === editingId ? { ...data.hospital, doctors: h.doctors } : h)));
      setEditingId(null);
      setFormData({ name: "", address: "", lat: "", lng: "", phone: "", type: "General" });
      toast.success("Hospital updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function startEdit(hospital: HospitalData) {
    setEditingId(hospital.id);
    setFormData({
      name: hospital.name,
      address: hospital.address,
      lat: hospital.lat.toString(),
      lng: hospital.lng.toString(),
      phone: hospital.phone,
      type: hospital.type,
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
            <h1 className="page-title" style={{ fontSize: "28px", marginBottom: "4px" }}>Manage Hospitals</h1>
          </div>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              if (!isAdding) setFormData({ name: "", address: "", lat: "6.9271", lng: "79.8612", phone: "", type: "General" });
            }} 
            className={isAdding ? "btn-secondary" : "btn-primary"} 
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {isAdding ? "Cancel" : <><Plus size={18} /> Add Hospital</>}
          </button>
        </div>

        {/* Add / Edit Form Card matching UI Screenshots */}
        {(isAdding || editingId) && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "32px", border: `1px solid ${editingId ? 'var(--moderate)' : 'var(--primary-light)'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px" }}>{editingId ? "Edit Hospital Details" : "Add New Hospital"}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label">Hospital Name</label>
                <input required className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="National Hospital of Sri Lanka" />
              </div>
              <div>
                <label className="form-label">Contact Phone</label>
                <input required className="form-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="0112691111" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Full Address</label>
                <input required className="form-input" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Regent Street, Colombo 08" />
              </div>
              <div>
                <label className="form-label">Latitude</label>
                <input required type="number" step="any" className="form-input" value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})} placeholder="6.9271" />
              </div>
              <div>
                <label className="form-label">Longitude</label>
                <input required type="number" step="any" className="form-input" value={formData.lng} onChange={(e) => setFormData({...formData, lng: e.target.value})} placeholder="79.8612" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Hospital Type</label>
                <select className="form-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="General">General Hospital</option>
                  <option value="Teaching">Teaching Hospital</option>
                  <option value="Private">Private Hospital</option>
                  <option value="Specialized">Specialized Center</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: editingId ? 'var(--moderate)' : 'var(--primary-light)', color: editingId ? '#000' : '#fff' }}>
                  {editingId ? "Update Hospital" : "Save Hospital"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hospital Grid matching Screenshot */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {hospitals.map((h) => (
            <div key={h.id} className="glass-card" style={{ padding: "20px", border: editingId === h.id ? '2px solid var(--moderate)' : '1px solid var(--glass-border)' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "rgba(6, 214, 160, 0.1)", padding: "10px", borderRadius: "10px", color: "var(--mild)" }}>
                    <HospitalIcon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 600 }}>{h.name}</h3>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", textTransform: "uppercase" }}>{h.type}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => startEdit(h)}
                    style={{ background: "rgba(255, 209, 102, 0.1)", border: "none", padding: "6px", borderRadius: "6px", color: "var(--moderate)", cursor: "pointer" }}
                    aria-label="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(h.id)}
                    style={{ background: "rgba(239, 71, 111, 0.1)", border: "none", padding: "6px", borderRadius: "6px", color: "#EF476F", cursor: "pointer" }}
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-light)" }}><MapPin size={14} color="var(--primary-light)" /> {h.address}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-light)" }}><Phone size={14} color="var(--primary-light)" /> {h.phone}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
                  <span>GPS: {h.lat.toFixed(4)}, {h.lng.toFixed(4)}</span>
                  <span>{h.doctors?.length || 0} Doctors</span>
                </div>
              </div>
            </div>
          ))}
          {hospitals.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No hospitals found. Click &quot;Add Hospital&quot; to register one.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
