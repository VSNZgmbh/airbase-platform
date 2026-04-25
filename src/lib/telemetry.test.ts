import { describe, it, expect } from "vitest";
import {
  djiOsdToTelemetry,
  validateIngestPayload,
  validateBAZLReport,
  type DJICloudOSDMessage,
} from "./telemetry";

// ─── Helper: build a valid OSD message ──────────────────────────────────────

function makeOSD(overrides?: Partial<DJICloudOSDMessage["data"]>): DJICloudOSDMessage {
  return {
    tid: "t1",
    bid: "b1",
    timestamp: Date.now(),
    data: {
      latitude: 46.69,
      longitude: 7.86,
      height: 700,
      elevation: 120,
      attitude_head: 180,
      horizontal_speed: 15,
      vertical_speed: 0,
      battery: {
        capacity_percent: 80,
        voltage: 52000,
        remain_flight_time: 600,
      },
      payload_weight: 50000,
      winch_state: 0,
      cargo_lock: 1,
      cargo_temperature: 18,
      wind_speed: 5,
      signal_quality: 90,
      gps_number: 20,
      position_accuracy: 1.0,
      mode_code: 2,
      obstacle_avoidance: {
        front: 30,
        back: 30,
        left: 30,
        right: 30,
        up: 30,
      },
      ...overrides,
    },
  };
}

// ─── djiOsdToTelemetry() — unit conversions ─────────────────────────────────

describe("djiOsdToTelemetry() — unit conversions", () => {
  it("converts battery voltage from mV to V (52000 mV = 52 V)", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ battery: { capacity_percent: 80, voltage: 52000, remain_flight_time: 600 } }));
    expect(r.batteryVoltageV).toBe(52);
  });

  it("converts horizontal_speed from m/s to km/h (15 m/s = 54 km/h)", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ horizontal_speed: 15 }));
    expect(r.speedKmh).toBe(54);
  });

  it("converts payload_weight from g to kg (50000 g = 50 kg)", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ payload_weight: 50000 }));
    expect(r.payloadWeightKg).toBe(50);
  });

  it("winch_state 1 maps to winchActive: true", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ winch_state: 1 }));
    expect(r.winchActive).toBe(true);
  });

  it("winch_state 0 maps to winchActive: false", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ winch_state: 0 }));
    expect(r.winchActive).toBe(false);
  });

  it("cargo_lock 1 maps to cargoLocked: true", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ cargo_lock: 1 }));
    expect(r.cargoLocked).toBe(true);
  });

  it("cargo_lock 0 maps to cargoLocked: false", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ cargo_lock: 0 }));
    expect(r.cargoLocked).toBe(false);
  });
});

// ─── djiOsdToTelemetry() — cargoTempC null guard ───────────────────────────

describe("djiOsdToTelemetry() — cargoTempC null guard", () => {
  it("returns null when cargo_temperature is undefined", () => {
    const msg = makeOSD();
    // Simulate absent field at runtime
    delete (msg.data as Record<string, unknown>).cargo_temperature;
    const r = djiOsdToTelemetry("SN001", msg);
    expect(r.cargoTempC).toBeNull();
  });

  it("returns the temperature value when present", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ cargo_temperature: 4.5 }));
    expect(r.cargoTempC).toBe(4.5);
  });
});

// ─── Warning generation ─────────────────────────────────────────────────────

describe("djiOsdToTelemetry() — warning generation", () => {
  it("battery 15% triggers BAT_LOW critical warning", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ battery: { capacity_percent: 15, voltage: 48000, remain_flight_time: 120 } }));
    const w = r.warnings.find((w) => w.code === "BAT_LOW");
    expect(w).toBeDefined();
    expect(w!.severity).toBe("critical");
  });

  it("battery 25% triggers BAT_WARN warning", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ battery: { capacity_percent: 25, voltage: 49000, remain_flight_time: 200 } }));
    const w = r.warnings.find((w) => w.code === "BAT_WARN");
    expect(w).toBeDefined();
    expect(w!.severity).toBe("warning");
  });

  it("battery 30% triggers no battery warning", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ battery: { capacity_percent: 30, voltage: 50000, remain_flight_time: 250 } }));
    expect(r.warnings.find((w) => w.code === "BAT_LOW" || w.code === "BAT_WARN")).toBeUndefined();
  });

  it("wind_speed 13 m/s triggers WIND_HIGH critical", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ wind_speed: 13 }));
    const w = r.warnings.find((w) => w.code === "WIND_HIGH");
    expect(w).toBeDefined();
    expect(w!.severity).toBe("critical");
  });

  it("wind_speed 11 m/s triggers WIND_HIGH warning", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ wind_speed: 11 }));
    const w = r.warnings.find((w) => w.code === "WIND_HIGH");
    expect(w).toBeDefined();
    expect(w!.severity).toBe("warning");
  });

  it("wind_speed 10 m/s triggers no wind warning (boundary: not > 10)", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ wind_speed: 10 }));
    expect(r.warnings.find((w) => w.code === "WIND_HIGH")).toBeUndefined();
  });

  it("signal_quality 29 triggers SIGNAL_LOW warning", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ signal_quality: 29 }));
    const w = r.warnings.find((w) => w.code === "SIGNAL_LOW");
    expect(w).toBeDefined();
    expect(w!.severity).toBe("warning");
  });

  it("signal_quality 30 triggers no signal warning", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({ signal_quality: 30 }));
    expect(r.warnings.find((w) => w.code === "SIGNAL_LOW")).toBeUndefined();
  });

  it("obstacle_avoidance.front 4.9 triggers OBS_FRONT critical", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({
      obstacle_avoidance: { front: 4.9, back: 30, left: 30, right: 30, up: 30 },
    }));
    const w = r.warnings.find((w) => w.code === "OBS_FRONT");
    expect(w).toBeDefined();
    expect(w!.severity).toBe("critical");
  });

  it("obstacle_avoidance.front 5.0 triggers no obstacle warning (boundary: not < 5)", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({
      obstacle_avoidance: { front: 5.0, back: 30, left: 30, right: 30, up: 30 },
    }));
    expect(r.warnings.find((w) => w.code === "OBS_FRONT")).toBeUndefined();
  });

  it("multiple warnings are generated simultaneously", () => {
    const r = djiOsdToTelemetry("SN001", makeOSD({
      battery: { capacity_percent: 15, voltage: 46000, remain_flight_time: 60 },
      wind_speed: 13,
      signal_quality: 20,
    }));
    expect(r.warnings.length).toBeGreaterThanOrEqual(3);
    expect(r.warnings.some((w) => w.code === "BAT_LOW")).toBe(true);
    expect(r.warnings.some((w) => w.code === "WIND_HIGH")).toBe(true);
    expect(r.warnings.some((w) => w.code === "SIGNAL_LOW")).toBe(true);
  });
});

// ─── validateIngestPayload() ────────────────────────────────────────────────

describe("validateIngestPayload()", () => {
  it("valid object returns { valid: true }", () => {
    expect(validateIngestPayload({ droneSerial: "SN001", lat: 46.5, lng: 7.5, altitudeMslM: 700 })).toEqual({ valid: true });
  });

  it("null body returns { valid: false }", () => {
    expect(validateIngestPayload(null).valid).toBe(false);
  });

  it("missing droneSerial returns { valid: false }", () => {
    expect(validateIngestPayload({ lat: 46.5, lng: 7.5, altitudeMslM: 700 }).valid).toBe(false);
  });

  it("lat: 91 (out of range) returns { valid: false }", () => {
    expect(validateIngestPayload({ droneSerial: "SN001", lat: 91, lng: 7.5, altitudeMslM: 700 }).valid).toBe(false);
  });

  it("lng: -181 (out of range) returns { valid: false }", () => {
    expect(validateIngestPayload({ droneSerial: "SN001", lat: 46.5, lng: -181, altitudeMslM: 700 }).valid).toBe(false);
  });

  it("missing altitudeMslM returns { valid: false }", () => {
    expect(validateIngestPayload({ droneSerial: "SN001", lat: 46.5, lng: 7.5 }).valid).toBe(false);
  });
});

// ─── validateBAZLReport() ───────────────────────────────────────────────────

describe("validateBAZLReport()", () => {
  it("valid object returns { valid: true }", () => {
    expect(validateBAZLReport({ trackerImei: "IMEI001", droneSerial: "SN001", lat: 46.5, lng: 7.5, altitudeM: 700 })).toEqual({ valid: true });
  });

  it("null body returns { valid: false }", () => {
    expect(validateBAZLReport(null).valid).toBe(false);
  });

  it("missing trackerImei returns { valid: false }", () => {
    expect(validateBAZLReport({ droneSerial: "SN001", lat: 46.5, lng: 7.5, altitudeM: 700 }).valid).toBe(false);
  });

  it("missing droneSerial returns { valid: false }", () => {
    expect(validateBAZLReport({ trackerImei: "IMEI001", lat: 46.5, lng: 7.5, altitudeM: 700 }).valid).toBe(false);
  });

  it("lat out of range returns { valid: false }", () => {
    expect(validateBAZLReport({ trackerImei: "IMEI001", droneSerial: "SN001", lat: -91, lng: 7.5, altitudeM: 700 }).valid).toBe(false);
  });

  it("missing altitudeM returns { valid: false }", () => {
    expect(validateBAZLReport({ trackerImei: "IMEI001", droneSerial: "SN001", lat: 46.5, lng: 7.5 }).valid).toBe(false);
  });
});
