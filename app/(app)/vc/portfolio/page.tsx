import { StatCard } from "@/components/ui/Card";

const PORTFOLIO = [
  { id: 1, company: "Meridian AI", sector: "AI / ML", invested: "$5M", currentArr: "$2.1M", stage: "Series A", multiple: "2.8x" },
  { id: 2, company: "Stackform", sector: "SaaS", invested: "$3M", currentArr: "$3.8M", stage: "Series A", multiple: "3.1x" },
  { id: 3, company: "Neurova", sector: "Healthcare AI", invested: "$2M", currentArr: "$980K", stage: "Seed", multiple: "1.9x" },
  { id: 4, company: "FlowBridge", sector: "Fintech", invested: "$4M", currentArr: "$1.6M", stage: "Seed", multiple: "2.2x" },
  { id: 5, company: "Phalanx Security", sector: "Cybersecurity", invested: "$6M", currentArr: "$4.2M", stage: "Series A", multiple: "2.5x" },
];

export default function VcPortfolioPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Portfolio</div>
          <div className="page-subtitle">Companies you&apos;ve invested in via VentureBridge</div>
        </div>
      </div>

      <div className="px-10 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Deployed" value="$42M" delta="↑ +$3.2M this quarter" deltaType="up" />
          <StatCard label="Portfolio Cos" value="18" delta="3 raising follow-on" deltaType="neutral" />
          <StatCard
            label="Avg Match Score"
            value={<><span className="text-vb-blue">88</span><span className="text-[20px]">%</span></>}
            delta="High conviction deals"
            deltaType="up"
          />
          <StatCard
            label="Unrealized Return"
            value={<span className="text-vb-green">2.4x</span>}
            delta="↑ Strong vintage"
            deltaType="up"
          />
        </div>

        {/* Portfolio Table */}
        <div className="vb-table-wrap">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="vb-th">Company</th>
                <th className="vb-th">Sector</th>
                <th className="vb-th">Invested</th>
                <th className="vb-th">Current ARR</th>
                <th className="vb-th">Stage</th>
                <th className="vb-th">Multiple</th>
              </tr>
            </thead>
            <tbody>
              {PORTFOLIO.map((row) => (
                <tr key={row.id} className="hover:bg-vb-blue/[0.04] transition-colors cursor-pointer">
                  <td className="vb-td font-semibold">{row.company}</td>
                  <td className="vb-td text-vb-text-secondary">{row.sector}</td>
                  <td className="vb-td font-mono text-[13px]">{row.invested}</td>
                  <td className="vb-td font-mono text-[13px]">{row.currentArr}</td>
                  <td className="vb-td">
                    <span className="vb-badge vb-badge-blue">{row.stage}</span>
                  </td>
                  <td className="vb-td font-display text-[20px] text-vb-green">{row.multiple}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
