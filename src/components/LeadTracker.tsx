import { BarChart3, CalendarCheck2, Save, Users } from "lucide-react";
import { useState } from "react";
import type {
  CampaignRecord,
  LeadRecord,
  LeadSource,
  LeadStatus,
} from "../types/platform";
import { createId } from "../utils/createId";

interface LeadTrackerProps {
  campaigns: CampaignRecord[];
  leads: LeadRecord[];
  onSaveLeads: (leads: LeadRecord[]) => void;
}

const defaultLeadSource: LeadSource = "manual";
const defaultLeadStatus: LeadStatus = "new";

const statusClasses: Record<LeadStatus, string> = {
  new: "bg-muted text-foreground",
  qualified: "bg-primary/10 text-primary",
  contacted: "bg-amber-500/10 text-amber-300",
  booked: "bg-emerald-500/10 text-emerald-300",
  closed: "bg-violet-500/10 text-violet-300",
};

export default function LeadTracker({
  campaigns,
  leads,
  onSaveLeads,
}: LeadTrackerProps) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [contactName, setContactName] = useState("");
  const [source, setSource] = useState<LeadSource>(defaultLeadSource);
  const [status, setStatus] = useState<LeadStatus>(defaultLeadStatus);
  const [booked, setBooked] = useState(false);
  const [notes, setNotes] = useState("");
  const activeCampaignId = campaigns.some(
    (campaign) => campaign.id === campaignId,
  )
    ? campaignId
    : campaigns[0]?.id ?? "";

  const handleSaveLead = () => {
    if (!activeCampaignId) {
      return;
    }

    const nextLead: LeadRecord = {
      id: createId("lead"),
      campaignId: activeCampaignId,
      source,
      status,
      createdAt: new Date().toISOString(),
      notes,
      booked,
      contactName: contactName.trim() || "Unnamed lead",
    };

    onSaveLeads([nextLead, ...leads]);
    setContactName("");
    setSource(defaultLeadSource);
    setStatus(defaultLeadStatus);
    setBooked(false);
    setNotes("");
  };

  const bookedCount = leads.filter((lead) => lead.booked).length;
  const qualifiedCount = leads.filter(
    (lead) => lead.status === "qualified",
  ).length;
  const activeCount = leads.filter((lead) => lead.status !== "closed").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Leads</p>
              <p className="text-2xl font-black text-foreground">{activeCount}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Foundation for campaign-linked intake and lead status tracking.
          </p>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booked</p>
              <p className="text-2xl font-black text-foreground">{bookedCount}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Lead records can already carry booked state for later analytics.
          </p>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-muted text-foreground flex items-center justify-center">
              <BarChart3 size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Qualified</p>
              <p className="text-2xl font-black text-foreground">
                {qualifiedCount}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Performance dashboards can build on this schema without a refactor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
        <div className="surface-card p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Lead Record</h2>
            <p className="text-sm text-muted-foreground">
              Basic campaign-linked tracking for source, status, and notes.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Campaign
            </label>
            <select
              value={activeCampaignId}
              onChange={(event) => setCampaignId(event.target.value)}
              className="input-base text-sm"
            >
              {campaigns.length === 0 ? (
                <option value="">No saved campaigns yet</option>
              ) : (
                campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.inputs.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Contact Name
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              className="input-base text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Source
              </label>
              <select
                value={source}
                onChange={(event) => setSource(event.target.value as LeadSource)}
                className="input-base text-sm"
              >
                {(
                  [
                    "manual",
                    "website",
                    "phone",
                    "landing-page",
                    "social",
                    "referral",
                  ] as LeadSource[]
                ).map((sourceOption) => (
                  <option key={sourceOption} value={sourceOption}>
                    {sourceOption}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as LeadStatus)}
                className="input-base text-sm"
              >
                {(
                  [
                    "new",
                    "qualified",
                    "contacted",
                    "booked",
                    "closed",
                  ] as LeadStatus[]
                ).map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="input-base text-sm"
            />
          </div>

          <label className="surface-subtle flex items-center gap-3 px-4 py-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={booked}
              onChange={(event) => setBooked(event.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            Mark as booked
          </label>

          <button
            type="button"
            onClick={handleSaveLead}
            disabled={!activeCampaignId}
            className="button-primary w-full px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            Save Lead
          </button>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Lead Activity</h2>
              <p className="text-sm text-muted-foreground">
                Campaign-linked records ready for future conversion analytics.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {leads.length === 0 ? (
              <div className="surface-subtle border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
                No lead records yet. Save a campaign, then start logging inquiry
                sources, statuses, and booking outcomes here.
              </div>
            ) : (
              leads.map((lead) => {
                const campaign = campaigns.find(
                  (campaignRecord) => campaignRecord.id === lead.campaignId,
                );

                return (
                  <div
                    key={lead.id}
                    className="surface-subtle px-5 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-foreground">
                          {lead.contactName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {campaign?.inputs.name ?? "Unknown campaign"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-card-foreground">
                          {lead.source}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[lead.status]}`}
                        >
                          {lead.status}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {lead.notes || "No notes added yet."}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(lead.createdAt).toLocaleString()}</span>
                      <span>{lead.booked ? "Booked" : "Not booked"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
