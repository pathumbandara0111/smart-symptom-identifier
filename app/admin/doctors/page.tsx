"use client";
import { useEffect, useState } from "react";
import { Users, Trash2, Plus, Loader2, Hospital as HospitalIcon, Phone, Stethoscope, Edit2, X, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Hospital {
  id: string;
  name: string;
}

interface DoctorData {
  id: string;
  name: string;
  speciality: string;
  fee: number;
  phone: string;
  hospitalId: string;
  available: boolean;
  hospital?: Hospital;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  
  const [formData, setFormData] = useState({ name: "", speciality: "", fee: "", phone: "", hospitalId: "" });

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
      fetchData();
    } catch (err) {
      router.push("/admin/login");
    }
  }

  async function fetchData() {
    try {
      const [resDocs, resHosp] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/hospitals")
      ]);
      const dataDocs = await resDocs.json();
      const dataHosp = await resHosp.json();
      
      if (!resDocs.ok) throw new Error(dataDocs.error);
      if (!resHosp.ok) throw new Error(dataHosp.error);
      
      setDoctors(dataDocs.doctors);
      setHospitals(dataHosp.hospitals);
      
      if (dataHosp.hospitals.length > 0 && !formData.hospitalId) {
        setFormData(prev => ({ ...prev, hospitalId: dataHosp.hospitals[0].id }));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this doctor?")) return;
    try {
      const res = await fetch(`/api/doctors?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDoctors(doctors.filter((d) => d.id !== id));
      toast.success("Doctor removed");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const reqBody = { ...formData, fee: parseFloat(formData.fee) };
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const newDoctor = data.doctor;
      newDoctor.hospital = hospitals.find(h => h.id === formData.hospitalId);
      
      setDoctors([...doctors, newDoctor]);
      setIsAdding(false);
      setFormData({ name: "", speciality: "", fee: "", phone: "", hospitalId: hospitals[0]?.id || "" });
      toast.success("Doctor added successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    
    try {
      const reqBody = { id: editingId, ...formData, fee: parseFloat(formData.fee) };
      const res = await fetch("/api/doctors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const updatedDoctor = data.doctor;
      updatedDoctor.hospital = hospitals.find(h => h.id === formData.hospitalId);
      
      setDoctors(doctors.map(d => d.id === editingId ? updatedDoctor : d));
      setEditingId(null);
      setFormData({ name: "", speciality: "", fee: "", phone: "", hospitalId: hospitals[0]?.id || "" });
      toast.success("Doctor updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function startEdit(doctor: DoctorData) {
    setEditingId(doctor.id);
    setFormData({
      name: doctor.name,
      speciality: doctor.speciality,
      fee: doctor.fee.toString(),
      phone: doctor.phone,
      hospitalId: doctor.hospitalId
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
              ← Back to Dashboard
            </Link>
            <h1 className="page-title" style={{ fontSize: "28px", marginBottom: "4px" }}>Manage Doctors</h1>
          </div>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              if (!isAdding) setFormData({ name: "", speciality: "", fee: "", phone: "", hospitalId: hospitals[0]?.id || "" });
            }} 
            className={isAdding ? "btn-secondary" : "btn-primary"} 
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {isAdding ? "Cancel" : <><Plus size={18} /> Add Doctor</>}
          </button>
        </div>

        {(isAdding || editingId) && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: "32px", border: `1px solid ${editingId ? 'var(--warning)' : 'var(--primary-light)'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px" }}>{editingId ? "Edit Doctor Details" : "Add New Doctor"}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            {hospitals.length === 0 ? (
              <div style={{ color: "var(--danger)" }}>Please add a hospital first before adding a doctor.</div>
            ) : (
              <form onSubmit={editingId ? handleUpdate : handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="form-label">Doctor Name</label>
                  <input required className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Dr. John Doe" />
                </div>
                <div>
                  <label className="form-label">Speciality</label>
                  <input required className="form-input" value={formData.speciality} onChange={(e) => setFormData({...formData, speciality: e.target.value})} placeholder="Cardiologist" />
                </div>
                <div>
                  <label className="form-label">Consultation Fee (Rs.)</label>
                  <input required type="number" step="any" className="form-input" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} placeholder="2500" />
                </div>
                <div>
                  <label className="form-label">Contact Phone</label>
                  <input required className="form-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="0712345678" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Assign to Hospital</label>
                  <select required className="form-input" value={formData.hospitalId} onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary" style={{ background: editingId ? 'var(--warning)' : 'var(--primary-light)', borderColor: editingId ? 'var(--warning)' : 'var(--primary-light)' }}>
                    {editingId ? "Update Doctor" : "Save Doctor"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {doctors.map((d) => (
            <div key={d.id} className="glass-card" style={{ padding: "20px", border: editingId === d.id ? '2px solid var(--warning)' : '1px solid var(--glass-border)' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "rgba(0, 180, 216, 0.1)", padding: "10px", borderRadius: "10px", color: "var(--primary-light)" }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 600 }}>{d.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "13px" }}>
                      <Stethoscope size={12} /> {d.speciality}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => startEdit(d)}
                    style={{ background: "rgba(255, 209, 102, 0.1)", border: "none", padding: "6px", borderRadius: "6px", color: "var(--warning)", cursor: "pointer" }}
                    aria-label="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(d.id)}
                    style={{ background: "rgba(239, 71, 111, 0.1)", border: "none", padding: "6px", borderRadius: "6px", color: "#EF476F", cursor: "pointer" }}
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-light)" }}><HospitalIcon size={14} color="var(--primary-light)" /> {d.hospital?.name || "Unknown"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-light)" }}><Phone size={14} color="var(--primary-light)" /> {d.phone}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>Rs. {d.fee}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ visit</span>
                </div>
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No doctors found. Click "Add Doctor" to register one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
