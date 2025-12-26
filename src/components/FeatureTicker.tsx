import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { apiGet } from "../lib/api";

interface FeatureTickerItem {
  id: number;
  text: string;
  position: number;
}

export const FeatureTicker = () => {
  const [features, setFeatures] = useState<FeatureTickerItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------------- FETCH FEATURE TICKER ----------------
  useEffect(() => {
    loadFeatureTicker();
  }, []);

  const loadFeatureTicker = async () => {
    setLoading(true);

    try {
      const data = await apiGet("feature-ticker/");
      const formatted = Array.isArray(data) ? data : [];
      const sorted = [...formatted].sort(
        (a, b) => a.position - b.position
      );

      setFeatures(sorted);
    } catch (err) {
      console.error("Error loading feature ticker:", err);
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !features.length) return null;

  const texts = features.map(item => item.text);

  return (
    <div className="bg-white text-black py-2 overflow-hidden border-y border-black/10">
      <div className="relative flex">
        <div className="flex items-center gap-8 animate-scroll whitespace-nowrap">
          {[...texts, ...texts].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 px-4">
              <span className="font-medium text-sm tracking-wide">
                {feature}
              </span>
              <ChevronRight className="w-4 h-4 text-black/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
