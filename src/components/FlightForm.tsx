"use client";

import { useState } from "react";
import { ChipField } from "@/components/ChipField";
import { Stepper } from "@/components/Stepper";
import { TimeField } from "@/components/TimeField";
import { computeBlockHours, digitsToTimeString, timeStringToDigits, todayIsoDate } from "@/lib/time";
import type { FlightInsert, FlightRow } from "@/types/database";

interface FlightFormProps {
  flight?: FlightRow;
  recentAircraftTypes: string[];
  recentTailNumbers: string[];
  recentAirports: string[];
  onSubmit: (flight: FlightInsert) => Promise<void>;
  submitLabel: string;
}

export function FlightForm({
  flight,
  recentAircraftTypes,
  recentTailNumbers,
  recentAirports,
  onSubmit,
  submitLabel,
}: FlightFormProps) {
  const isEdit = !!flight;

  const [flightDate, setFlightDate] = useState(flight?.flight_date ?? todayIsoDate());
  const [aircraftType, setAircraftType] = useState(flight?.aircraft_type ?? "");
  const [tailNumber, setTailNumber] = useState(flight?.tail_number ?? "");
  const [depAirport, setDepAirport] = useState(flight?.dep_airport ?? "");
  const [arrAirport, setArrAirport] = useState(flight?.arr_airport ?? "");
  const [outRaw, setOutRaw] = useState(timeStringToDigits(flight?.out_time ?? null));
  const [inRaw, setInRaw] = useState(timeStringToDigits(flight?.in_time ?? null));

  const [blockOverride, setBlockOverride] = useState(flight ? String(flight.block_time) : "");
  const [meOverride, setMeOverride] = useState(flight ? String(flight.multi_engine_time) : "");
  const [xcOverride, setXcOverride] = useState(flight ? String(flight.cross_country_time) : "");
  const [blockTouched, setBlockTouched] = useState(isEdit);
  const [meTouched, setMeTouched] = useState(isEdit);
  const [xcTouched, setXcTouched] = useState(isEdit);

  const [crewRole, setCrewRole] = useState<"SIC" | "PIC">(
    flight && flight.pic_time > 0 && flight.pic_time >= flight.sic_time ? "PIC" : "SIC"
  );
  const [nightTime, setNightTime] = useState(flight ? String(flight.night_time) : "0");
  const [dayLandings, setDayLandings] = useState(flight?.day_landings ?? 1);
  const [nightLandings, setNightLandings] = useState(flight?.night_landings ?? 0);

  const [moreOpen, setMoreOpen] = useState(false);
  const [instrumentTime, setInstrumentTime] = useState(flight ? String(flight.instrument_time) : "0");
  const [approaches, setApproaches] = useState(flight?.approaches ?? 0);
  const [remarks, setRemarks] = useState(flight?.remarks ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Block/multi-engine/cross-country time default to the out/in computed duration
  // until the pilot overrides them by hand.
  const computedBlock = computeBlockHours(digitsToTimeString(outRaw), digitsToTimeString(inRaw));
  const computedBlockStr = computedBlock !== null ? computedBlock.toFixed(1) : "";
  const blockTime = blockTouched ? blockOverride : computedBlockStr;
  const multiEngineTime = meTouched ? meOverride : blockTime;
  const crossCountryTime = xcTouched ? xcOverride : blockTime;

  const canSubmit =
    aircraftType.trim() !== "" &&
    depAirport.trim() !== "" &&
    arrAirport.trim() !== "" &&
    parseFloat(blockTime) > 0 &&
    !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    const block = parseFloat(blockTime) || 0;
    try {
      await onSubmit({
        flight_date: flightDate,
        aircraft_type: aircraftType.trim(),
        tail_number: tailNumber.trim() || null,
        dep_airport: depAirport.trim().toUpperCase(),
        arr_airport: arrAirport.trim().toUpperCase(),
        out_time: digitsToTimeString(outRaw),
        in_time: digitsToTimeString(inRaw),
        block_time: block,
        pic_time: crewRole === "PIC" ? block : 0,
        sic_time: crewRole === "SIC" ? block : 0,
        night_time: parseFloat(nightTime) || 0,
        multi_engine_time: parseFloat(multiEngineTime) || 0,
        cross_country_time: parseFloat(crossCountryTime) || 0,
        instrument_time: parseFloat(instrumentTime) || 0,
        day_landings: dayLandings,
        night_landings: nightLandings,
        approaches,
        remarks: remarks.trim() || null,
      });
      if (!isEdit) {
        // Reset for the next entry; keep date since back-to-back legs share a day.
        setAircraftType("");
        setTailNumber("");
        setDepAirport("");
        setArrAirport("");
        setOutRaw("");
        setInRaw("");
        setBlockOverride("");
        setMeOverride("");
        setXcOverride("");
        setBlockTouched(false);
        setMeTouched(false);
        setXcTouched(false);
        setCrewRole("SIC");
        setNightTime("0");
        setDayLandings(1);
        setNightLandings(0);
        setInstrumentTime("0");
        setApproaches(0);
        setRemarks("");
        setMoreOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flight");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-xs font-medium text-neutral-500">Date</span>
        <input
          type="date"
          value={flightDate}
          onChange={(e) => setFlightDate(e.target.value)}
          className="block w-full min-w-0 rounded-xl border border-neutral-300 bg-white px-3 py-3 text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </label>

      <ChipField
        label="Aircraft type"
        value={aircraftType}
        onChange={setAircraftType}
        recentValues={recentAircraftTypes}
        placeholder="e.g. A320"
        uppercase
      />

      <div className="grid grid-cols-2 gap-3">
        <ChipField
          label="From"
          value={depAirport}
          onChange={setDepAirport}
          recentValues={recentAirports}
          placeholder="ICAO"
          uppercase
          maxLength={4}
        />
        <ChipField
          label="To"
          value={arrAirport}
          onChange={setArrAirport}
          recentValues={recentAirports}
          placeholder="ICAO"
          uppercase
          maxLength={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TimeField label="Out" value={outRaw} onChange={setOutRaw} />
        <TimeField label="In" value={inRaw} onChange={setInRaw} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Block time (hrs)</span>
          <input
            type="text"
            inputMode="decimal"
            value={blockTime}
            onChange={(e) => {
              setBlockOverride(e.target.value);
              setBlockTouched(true);
            }}
            placeholder="0.0"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-center text-2xl font-semibold tabular-nums text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Logged as</span>
          <div className="flex rounded-xl border border-neutral-300 bg-neutral-50 p-1">
            {(["SIC", "PIC"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setCrewRole(role)}
                className={`flex-1 rounded-lg py-2.5 text-base font-semibold ${
                  crewRole === role ? "bg-blue-600 text-white" : "text-neutral-600"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Night (hrs)</span>
          <input
            type="text"
            inputMode="decimal"
            value={nightTime}
            onChange={(e) => setNightTime(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-2 py-3 text-center text-lg font-semibold tabular-nums text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <Stepper label="Day ldg" value={dayLandings} onChange={setDayLandings} />
        <Stepper label="Night ldg" value={nightLandings} onChange={setNightLandings} />
      </div>

      <details
        open={moreOpen}
        onToggle={(e) => setMoreOpen((e.target as HTMLDetailsElement).open)}
        className="rounded-xl border border-neutral-200"
      >
        <summary className="cursor-pointer select-none px-3 py-3 text-sm font-medium text-neutral-600">
          More details
        </summary>
        <div className="flex flex-col gap-4 px-3 pb-4">
          <ChipField
            label="Tail number"
            value={tailNumber}
            onChange={setTailNumber}
            recentValues={recentTailNumbers}
            placeholder="optional"
            uppercase
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-500">Multi-engine (hrs)</span>
              <input
                type="text"
                inputMode="decimal"
                value={multiEngineTime}
                onChange={(e) => {
                  setMeOverride(e.target.value);
                  setMeTouched(true);
                }}
                className="w-full rounded-xl border border-neutral-300 bg-white px-2 py-3 text-center text-lg font-semibold tabular-nums text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-500">Cross-country (hrs)</span>
              <input
                type="text"
                inputMode="decimal"
                value={crossCountryTime}
                onChange={(e) => {
                  setXcOverride(e.target.value);
                  setXcTouched(true);
                }}
                className="w-full rounded-xl border border-neutral-300 bg-white px-2 py-3 text-center text-lg font-semibold tabular-nums text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-500">Instrument (hrs)</span>
              <input
                type="text"
                inputMode="decimal"
                value={instrumentTime}
                onChange={(e) => setInstrumentTime(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-2 py-3 text-center text-lg font-semibold tabular-nums text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <Stepper label="Approaches" value={approaches} onChange={setApproaches} />
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-500">Remarks</span>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>
      </details>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white disabled:bg-neutral-300"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
