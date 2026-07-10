import { useState } from "react";
import ServiceBlock from "../components/ServiceBlock";
import TechnicianBlock from "../components/TechnicianBlock";
import ReservationModal from "../components/ReservationModal";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ServicesSection({
  services,
  techniciens,
  categories,
  user,
  searchService,
  setSearchService,
  searchCity,
  setSearchCity
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  
  const filteredServices = services.filter(
    s => !searchService || s.titre?.toLowerCase().includes(searchService.toLowerCase())
  );

  const filteredTechniciens = techniciens.filter(
    t => !searchCity || t.ville?.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <>
      <section id="services-section" className="mb-12">

        <h2 className="text-xl font-bold mb-2">
          {t("home.section_available_services_title")}
        </h2>

        <div className="grid grid-cols-3 gap-5">
          {filteredServices.map(s => (
            <ServiceBlock
              key={s.id}
              service={s}
              onBook={(svc) => {
                if (!user) return navigate("/login");
                setSelectedService(svc);
              }}
            />
          ))}
        </div>
      </section>

      {selectedService && (
        <ReservationModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">
          {t("home.section_techs_title")}
        </h2>

        <div className="grid grid-cols-4 gap-5">
          {filteredTechniciens.map((tech, i) => (
            <TechnicianBlock key={tech.id} technicien={tech} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}