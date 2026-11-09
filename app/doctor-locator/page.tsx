"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { 
  MapPin, 
  Search, 
  Phone, 
  Navigation, 
  Hospital as HospitalIcon, 
  Loader2,
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
  phone: string;
  available: boolean;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  type: string;
  doctors: Doctor[];
}

export default function DoctorLocatorPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Default center: Colombo, Sri Lanka
  const defaultCenter = { lat: 6.9271, lng: 79.8612 };

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    try {
      const res = await fetch("/api/hospitals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch hospitals");
      setHospitals(data.hospitals || []);
      initMap(data.hospitals || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load hospitals");
      setLoading(false);
    }
  }

  const initMap = async (hospitalData: Hospital[]) => {
    try {
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
      if (!key) {
        setLoading(false);
        return;
      }

      setOptions({ key, v: "weekly" });

      const { Map } = await importLibrary("maps") as any;
      const { Marker } = await importLibrary("marker") as any;
      
      if (!mapRef.current) return;

      const newMap = new Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        styles: [
          { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }, { weight: "0.1" }] },
          { featureType: "all", elementType: "labels.text.stroke", stylers: [{ visibility: "off" }] },
          { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#020b18" }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#051525" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#0a2a4a" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#03045e" }] },
        ],
        disableDefaultUI: false,
        zoomControl: true,
      });

      setMap(newMap);

      const newMarkers = hospitalData.map((h) => {
        const marker = new Marker({
          position: { lat: h.lat, lng: h.lng },
          map: newMap,
          title: h.name,
        });

        marker.addListener("click", () => {
          setSelectedHospital(h);
          newMap.panTo({ lat: h.lat, lng: h.lng });
          newMap.setZoom(15);
        });

        return marker;
      });

      setMarkers(newMarkers);
      setLoading(false);
    } catch (e) {
      console.error("Map initialization failed", e);
      setLoading(false);
    }
  };

  const filteredHospitals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return hospitals;
    return hospitals.filter((h) =>
      h.name.toLowerCase().includes(q) ||
      h.type.toLowerCase().includes(q) ||
      h.doctors.some((d) => 
        d.speciality.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q)
      )
    );
  }, [hospitals, searchQuery]);

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    if (map) {
      map.panTo({ lat: hospital.lat, lng: hospital.lng });
      map.setZoom(15);
    }
  };

  const getDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="page-container" style={{ paddingBottom: 0 }}>
      <div style={{ display: "flex", height: "calc(100vh - 70px)", width: "100%", overflow: "hidden" }}>
        
        {/* Left Sidebar */}
        <div 
          style={{ 
            width: "420px", 
            minWidth: "320px",
            background: "rgba(2, 11, 24, 0.95)", 
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRight: "1px solid var(--glass-border)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
          }}
        >
          {/* Header & Search */}
          <div style={{ padding: "24px", borderBottom: "1px solid var(--glass-border)" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Stethoscope size={22} color="var(--primary-light)" />
              Doctor & Hospital Locator
            </h1>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={16} />
              <input 
                type="text" 
                placeholder="Search hospitals or specialities..." 
                className="form-input"
                style={{ paddingLeft: "40px", fontSize: "14px", padding: "10px 14px 10px 40px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List of Hospitals */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-muted)" }}>
                <Loader2 className="animate-spin mb-4" size={32} />
                <p style={{ fontSize: "14px" }}>Loading medical facilities...</p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <HospitalIcon size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
                <p>No facilities found matching your search.</p>
              </div>
            ) : (
              filteredHospitals.map((h) => {
                const isSelected = selectedHospital?.id === h.id;
                return (
                  <div 
                    key={h.id} 
                    className="glass-card"
                    style={{ 
                      padding: "16px", 
                      cursor: "pointer", 
                      transition: "all 0.2s",
                      borderColor: isSelected ? "var(--primary-light)" : "var(--glass-border)",
                      background: isSelected ? "rgba(0, 180, 216, 0.12)" : "var(--glass-bg)",
                    }}
                    onClick={() => handleHospitalClick(h)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{h.name}</h3>
                      <span style={{ fontSize: "10px", background: "rgba(0, 180, 216, 0.15)", color: "var(--primary-light)", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase" }}>
                        {h.type}
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <MapPin size={12} color="var(--primary-light)" /> {h.address}
                    </p>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <a 
                        href={`tel:${h.phone}`} 
                        className="btn-secondary" 
                        style={{ flex: 1, fontSize: "12px", padding: "6px 10px", justifyContent: "center" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={12} /> Call
                      </a>
                      <button 
                        className="btn-primary" 
                        style={{ flex: 1, fontSize: "12px", padding: "6px 10px", justifyContent: "center" }}
                        onClick={(e) => { e.stopPropagation(); getDirections(h.lat, h.lng); }}
                      >
                        <Navigation size={12} /> Directions
                      </button>
                    </div>

                    {h.doctors && h.doctors.length > 0 && (
                      <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(0, 180, 216, 0.1)", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)" }}>
                        <span>{h.doctors.length} Specialist Doctors</span>
                        <span style={{ color: "var(--mild)", fontWeight: 600 }}>From Rs. {Math.min(...h.doctors.map(d => d.fee))}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Map Canvas & Detail Modal */}
        <div style={{ flex: 1, position: "relative", height: "100%", background: "#020B18" }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

          {/* Hospital Specialists Drawer on Map */}
          {selectedHospital && (
            <div 
              className="glass-card"
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "360px",
                maxHeight: "calc(100% - 40px)",
                overflowY: "auto",
                padding: "24px",
                zIndex: 20,
                background: "rgba(5, 21, 37, 0.95)",
                border: "1px solid var(--border-hover)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 700 }}>{selectedHospital.name}</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{selectedHospital.address}</p>
                </div>
                <button 
                  onClick={() => setSelectedHospital(null)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px", padding: "4px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
                <button className="btn-primary" style={{ flex: 1, padding: "8px", fontSize: "13px" }} onClick={() => getDirections(selectedHospital.lat, selectedHospital.lng)}>
                  <Navigation size={14} /> Get Directions
                </button>
                <a href={`tel:${selectedHospital.phone}`} className="btn-secondary" style={{ flex: 1, padding: "8px", fontSize: "13px", justifyContent: "center" }}>
                  <Phone size={14} /> Call Desk
                </a>
              </div>

              <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: 600 }}>
                Available Specialists ({selectedHospital.doctors.length})
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedHospital.doctors.map((doc) => (
                  <div 
                    key={doc.id}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: "rgba(0, 119, 182, 0.08)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{doc.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--primary-light)", marginTop: "2px" }}>{doc.speciality}</div>
                      </div>
                      <a href={`tel:${doc.phone}`} style={{ color: "var(--text-primary)", padding: "4px" }}>
                        <Phone size={14} color="var(--primary-light)" />
                      </a>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "12px" }}>
                      <span style={{ color: "var(--mild)", fontWeight: 600 }}>Fee: Rs. {doc.fee}</span>
                      <span style={{ fontSize: "11px", color: doc.available ? "var(--mild)" : "var(--severe)" }}>
                        {doc.available ? "● Available Today" : "○ Not on duty"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
