import { useTranslation } from "react-i18next";

const statsIcons = ["📊", "📅", "⭐"];

export default function StatsSection({ stats }) {
  const { t } = useTranslation();

  const statKeys = [
    "home.stats_techs",
    "home.stats_bookings",
    "home.stats_reviews"
  ];

  return (
    <section className="grid grid-cols-3 gap-6 mb-12">
      {[stats.techniciens, stats.reservations, stats.reviews].map((val, i) => (
        <div key={i} className="p-6 border rounded-lg text-center">
          <div className="text-2xl mb-2">{statsIcons[i]}</div>
          <h3 className="text-2xl font-bold">{val}</h3>
          <p className="text-sm text-gray-500">{t(statKeys[i])}</p>
        </div>
      ))}
    </section>
  );
}