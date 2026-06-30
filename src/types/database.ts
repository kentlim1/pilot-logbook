export type FlightRow = {
  id: string;
  user_id: string;
  created_at: string;
  flight_date: string; // YYYY-MM-DD
  aircraft_type: string;
  tail_number: string | null;
  dep_airport: string;
  arr_airport: string;
  out_time: string | null; // HH:MM:SS
  in_time: string | null; // HH:MM:SS
  block_time: number;
  pic_time: number;
  sic_time: number;
  night_time: number;
  multi_engine_time: number;
  cross_country_time: number;
  instrument_time: number;
  is_turbine: boolean;
  day_landings: number;
  night_landings: number;
  approaches: number;
  remarks: string | null;
};

// The fields the entry form collects. user_id is attached separately by
// createFlight() from the signed-in session, never typed in by the pilot.
export type FlightInsert = Omit<FlightRow, "id" | "created_at" | "user_id">;
export type FlightUpdate = Partial<FlightInsert>;

export type Database = {
  public: {
    Tables: {
      flights: {
        Row: FlightRow;
        Insert: FlightInsert & { user_id: string };
        Update: FlightUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
