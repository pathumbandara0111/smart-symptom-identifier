"use client";
import { useEffect, useState } from "react";
import { Hospital, Trash2, Plus, Loader2, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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
  const { status } = useSession();
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "", lat: "", lng: "", phone: "", type: "General" });

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    } else if (status === "authenticated") {
      fetchHospitals();
    }
  }, [status]);

  async function fetchHospitals() {
    try {
      const res = await fetch("/api/hospitals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHospitals(data.hospitals);
    } catch (err: any) {
      toast.error(err.message || "Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this hospital? This will also delete all doctors associated with it.")) return;
    try {
      const res = await fetch(`/api/hospitals?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setHospitals(hospitals.filter((h) => h.id !== id));
      toast.success("Hospital deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const reqBody = { ...formData, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) };
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHospitals([...hospitals, data.hospital]);
      setIsAdding(false);
      setFormData({ name: "", address: "", lat: "", lng: "", phone: "", type: "General" });
      toast.success("Hospital added successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (loading || status === "loading") {
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
            <h1 className="page-title" style={{ fontSize: "28px", marginBottom: "4px" }}>Manage Hospitals</h1>
          </div>
          <button onClick={() => setIsAdding(!isAdding)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isAdding ? "Cancel" : <><Plus size={18} /> Add Hospital</>}
          </button>
        </div>

        {isAdding && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "32px", border: "1px solid var(--primary-light)" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Add New Hospital</h3>
            <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label">Hospital Name</label>
                <input required className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="General Hospital Colombo" />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select required className="form-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="General">General</option>
                  <option value="Private">Private</option>
                  <option value="Specialized">Specialized</option>
                  <option value="Clinic">Clinic</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Address</label>
                <input required className="form-input" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Regent St, Colombo 01000" />
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
                <label className="form-label">Phone Number</label>
                <input required className="form-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="0112691111" />
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn-primary">Save Hospital</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {hospitals.map((h) => (
            <div key={h.id} className="glass-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ background: "rgba(6, 214, 160, 0.1)", padding: "8px", borderRadius: "8px", color: "var(--success)" }}>
                    <Hospital size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{h.name}</h3>
                    <span style={{ fontSize: "12px", color: "var(--primary-light)" }}>{h.type}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(h.id)}
                  style={{ background: "rgba(239, 71, 111, 0.1)", border: "none", padding: "6px", borderRadius: "6px", color: "#EF476F", cursor: "pointer" }}
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={14} color="var(--text-muted)" /> {h.address}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Phone size={14} color="var(--text-muted)" /> {h.phone}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "10px" }}>
                    Doctors Registered: {h.doctors?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {hospitals.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No hospitals found. Click "Add Hospital" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
