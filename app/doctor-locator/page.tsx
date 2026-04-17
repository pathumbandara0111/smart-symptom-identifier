"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { 
  MapPin, 
  Search, 
  Phone, 
  Navigation, 
  User, 
  Hospital as HospitalIcon, 
  ChevronRight,
  Filter,
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
      setHospitals(data.hospitals);
      initMap(data.hospitals);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  const initMap = async (hospitalData: Hospital[]) => {
    try {
      setOptions({
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        v: "weekly",
      });

      const { Map } = await importLibrary("maps");
      const { Marker } = await importLibrary("marker");
      
      if (!mapRef.current) return;

      const newMap = new Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffffff" }, { weight: "0.1" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#020b18" }],
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#051525" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#0a2a4a" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#03045e" }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
      });

      setMap(newMap as any);

      // Add markers
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

      setMarkers(newMarkers as any);
      setLoading(false);
    } catch (e) {
      console.error("Map initialization failed", e);
      setLoading(false);
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.doctors.some((d) => 
        d.speciality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [hospitals, searchQuery]);

  // Update marker visibility when filtering
  useEffect(() => {
    markers.forEach((marker, index) => {
      const hospital = hospitals[index];
      const isVisible = filteredHospitals.some(fh => fh.id === hospital.id);
      marker.setVisible(isVisible);
    });
  }, [filteredHospitals, markers, hospitals]);

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
    <div className="locator-page-container page-container" style={{ padding: 0 }}>
      <div className="locator-layout" style={{ display: "flex", height: "100%", width: "100%" }}>
        
        {/* Sidebar */}
        <div className="locator-sidebar" style={{ 
          width: "400px", 
          background: "rgba(2, 11, 24, 0.95)", 
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--glass-border)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10
        }}>
          <div style={{ padding: "24px", borderBottom: "1px solid var(--glass-border)" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Stethoscope className="text-[var(--primary-light)]" />
              Doctor Locator
            </h1>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={18} />
              <input 
                type="text" 
                placeholder="Search hospitals or specialities..." 
                className="form-input"
                style={{ paddingLeft: "40px", fontSize: "14px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }} className="custom-scrollbar">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--text-muted)" }}>
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Loading medical facilities...</p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <Search size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
                <p>No facilities found matching your search.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredHospitals.map((h) => (
                  <div 
                    key={h.id} 
                    className={`glass-card ${selectedHospital?.id === h.id ? 'active-facility' : ''}`}
                    style={{ 
                      padding: "16px", 
                      cursor: "pointer", 
                      transition: "all 0.2s",
                      borderColor: selectedHospital?.id === h.id ? "var(--primary-light)" : "var(--glass-border)",
                      background: selectedHospital?.id === h.id ? "rgba(0, 180, 216, 0.05)" : "var(--glass-bg)"
                    }}
                    onClick={() => handleHospitalClick(h)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>{h.name}</h3>
                      <span style={{ fontSize: "10px", background: "rgba(0, 180, 216, 0.1)", color: "var(--primary-light)", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase" }}>
                        {h.type}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <MapPin size={12} /> {h.address}
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a href={`tel:${h.phone}`} className="btn-secondary" style={{ flex: 1, fontSize: "11px", padding: "6px" }} onClick={(e) => e.stopPropagation()}>
                        <Phone size={12} /> Call
                      </a>
                      <button className="btn-primary" style={{ flex: 1, fontSize: "11px", padding: "6px" }} onClick={(e) => { e.stopPropagation(); getDirections(h.lat, h.lng); }}>
                        <Navigation size={12} /> Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="locator-map" style={{ flex: 1, position: "relative", minHeight: "280px" }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          
          {/* Hospital Info Overlay */}
          {selectedHospital && (
            <div className="hospital-overlay" style={{ 
              position: "absolute", 
              bottom: "40px", 
              left: "40px", 
              right: "40px", 
              maxWidth: "600px",
              background: "rgba(2, 11, 24, 0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--primary-light)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              zIndex: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "4px" }}>{selectedHospital.name}</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{selectedHospital.address}</p>
                </div>
                <button 
                  onClick={() => setSelectedHospital(null)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={14} className="text-[var(--primary-light)]" />
                  Available Specialists ({selectedHospital.doctors.length})
                </p>
                <div style={{ display: "flex", overflowX: "auto", gap: "12px", paddingBottom: "8px" }} className="custom-scrollbar">
                  {selectedHospital.doctors.map((doc) => (
                    <div key={doc.id} style={{ 
                      minWidth: "180px", 
                      background: "rgba(255,255,255,0.03)", 
                      border: "1px solid var(--glass-border)",
                      borderRadius: "12px",
                      padding: "12px"
                    }}>
                      <p style={{ fontWeight: 700, color: "white", fontSize: "14px", marginBottom: "2px" }}>Dr. {doc.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--primary-light)", marginBottom: "8px" }}>{doc.speciality}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Rs. {doc.fee}</span>
                        <a href={`tel:${doc.phone}`} style={{ color: "var(--text-light)" }}><Phone size={14} /></a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => getDirections(selectedHospital.lat, selectedHospital.lng)}>
                  <Navigation size={18} /> Get Directions
                </button>
                <a href={`tel:${selectedHospital.phone}`} className="btn-secondary" style={{ flex: 1 }}>
                  <Phone size={18} /> Call Hospital
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .locator-page-container {
          height: calc(100vh - 70px);
          overflow: hidden;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 180, 216, 0.2);
          border-radius: 10px;
        }
        .active-facility {
          box-shadow: 0 0 20px rgba(0, 180, 216, 0.2);
        }
        @media (max-width: 768px) {
          .locator-page-container {
            height: auto !important;
            overflow: visible !important;
            padding-top: 70px !important;
            display: block !important;
          }
          .locator-layout {
            display: block !important;
            height: auto !important;
          }
          .locator-sidebar {
            width: 100% !important;
            height: 400px !important;
            max-height: 400px !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(0,180,216,0.2) !important;
          }
          .locator-map {
            width: 100% !important;
            height: 450px !important;
            min-height: 450px !important;
            display: block !important;
          }
          .hospital-overlay {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            max-width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            padding: 16px !important;
            z-index: 1000 !important;
          }
        }
      `}</style>
    </div>
  );
}