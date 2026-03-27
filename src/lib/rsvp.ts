import { supabase } from "@/integrations/supabase/client";

export type GuestRecord = {
  id: string;
  first_name: string;
  last_name: string;
  party_name: string;
  max_guests: number;
};

export type EventRsvpMap = Record<string, string>;

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

const fetchPartyMembers = async (partyName: string) => {
  const { data } = await supabase
    .from("guests")
    .select("first_name, last_name")
    .eq("party_name", partyName);

  return data ?? [];
};

const fetchRespondedRow = async (firstName: string, lastName: string) => {
  const { data } = await supabase
    .from("invited_guests")
    .select("*")
    .ilike("first_name", firstName)
    .ilike("last_name", lastName)
    .eq("has_responded", true)
    .limit(1);

  return ((data?.[0] ?? null) as any) || null;
};

const dedupeNames = (rows: any[]) => {
  return Array.from(
    new Set(
      rows
        .map((row) => `${row.first_name || ""} ${row.last_name || ""}`.trim())
        .filter(Boolean)
    )
  );
};

export const loadPartyRsvpState = async (
  found: GuestRecord,
  searchFirstName: string,
  searchLastName: string
) => {
  let responder = await fetchRespondedRow(searchFirstName, searchLastName);

  if (!responder) {
    const partyMembers = await fetchPartyMembers(found.party_name);

    for (const member of partyMembers) {
      if (
        member.first_name.toLowerCase() === searchFirstName.toLowerCase() &&
        member.last_name.toLowerCase() === searchLastName.toLowerCase()
      ) {
        continue;
      }

      responder = await fetchRespondedRow(member.first_name, member.last_name);
      if (responder) break;
    }
  }

  if (!responder) {
    return {
      previouslyResponded: false,
      eventRsvps: {},
      dietary: "",
      notes: "",
      accommodation: "",
      guestNames: [`${found.first_name} ${found.last_name}`],
      attendingCount: 1,
    };
  }

  let partyRows: any[] = [responder];

  if (responder.submitted_at) {
    const { data } = await supabase
      .from("invited_guests")
      .select("*")
      .eq("submitted_at", responder.submitted_at);

    if (data?.length) partyRows = data as any[];
  } else if (responder.group_id) {
    const { data } = await supabase
      .from("invited_guests")
      .select("*")
      .eq("group_id", responder.group_id);

    if (data?.length) partyRows = data as any[];
  }

  if (partyRows.length <= 1) {
    const partyMembers = await fetchPartyMembers(found.party_name);
    const memberRows = await Promise.all(
      partyMembers.map((member) => fetchRespondedRow(member.first_name, member.last_name))
    );
    const validRows = memberRows.filter(Boolean) as any[];
    if (validRows.length) partyRows = validRows;
  }

  const eventRsvps: EventRsvpMap = {};
  if (responder.welcome_party_rsvp) eventRsvps.welcome_party_rsvp = responder.welcome_party_rsvp;
  if (responder.wedding_day_rsvp) eventRsvps.wedding_day_rsvp = responder.wedding_day_rsvp;
  if (responder.pool_day_rsvp) eventRsvps.pool_day_rsvp = responder.pool_day_rsvp;

  const guestNames = dedupeNames(partyRows);

  return {
    previouslyResponded: true,
    eventRsvps,
    dietary: responder.dietary_restrictions ?? "",
    notes: responder.notes ?? "",
    accommodation: responder.room_preference ?? "",
    guestNames: guestNames.length ? guestNames : [`${found.first_name} ${found.last_name}`],
    attendingCount: guestNames.length || 1,
  };
};

export const savePartyRsvpState = async ({
  guestNames,
  eventRsvps,
  dietary,
  notes,
  accommodation,
}: {
  guestNames: string[];
  eventRsvps: EventRsvpMap;
  dietary: string;
  notes: string;
  accommodation: string;
}) => {
  const submittedAt = new Date().toISOString();
  const submissionGroupId = crypto.randomUUID();
  const cleanedGuestNames = guestNames.map((name) => name.trim()).filter(Boolean);

  for (const guestName of cleanedGuestNames) {
    const { firstName, lastName } = splitFullName(guestName);

    const rowData: any = {
      first_name: firstName,
      last_name: lastName,
      welcome_party_rsvp: eventRsvps.welcome_party_rsvp || null,
      wedding_day_rsvp: eventRsvps.wedding_day_rsvp || null,
      pool_day_rsvp: eventRsvps.pool_day_rsvp || null,
      dietary_restrictions: dietary.trim() || null,
      notes: notes.trim() || null,
      room_preference: accommodation || null,
      has_responded: true,
      submitted_at: submittedAt,
      group_id: submissionGroupId,
    };

    const { data: existing } = await supabase
      .from("invited_guests")
      .select("id")
      .ilike("first_name", firstName)
      .ilike("last_name", lastName)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from("invited_guests")
        .update(rowData)
        .eq("id", existing[0].id);
    } else {
      await supabase
        .from("invited_guests")
        .insert(rowData);
    }
  }

  return { submittedAt, submissionGroupId };
};
