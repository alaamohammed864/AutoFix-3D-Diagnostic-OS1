import { AiIntent } from './types';

export interface DetectedIntentResult {
  intent: AiIntent;
  confidence: number;
  extractedDtc?: string;
  extractedComponent?: string;
  extractedSymptom?: string;
  extractedVehicleText?: string;
}

const DTC_REGEX = /\b([PCBU][0-3][0-9A-Fa-f]{3})\b/i;

export function detectUserIntent(query: string): DetectedIntentResult {
  const q = query.trim().toLowerCase();
  const dtcMatch = query.match(DTC_REGEX);
  const extractedDtc = dtcMatch ? dtcMatch[1].toUpperCase() : undefined;

  // 1. Mechanic Report
  if (
    q.includes('mechanic report') ||
    q.includes('work order') ||
    q.includes('repair order') ||
    q.includes('technician report') ||
    q.includes('workshop report') ||
    q.includes('generate report') ||
    q.includes('ro report')
  ) {
    return {
      intent: 'GENERATE_MECHANIC_REPORT',
      confidence: 0.95,
      extractedDtc,
    };
  }

  // 2. Diagnostic Checklist
  if (
    q.includes('checklist') ||
    q.includes('check list') ||
    q.includes('inspection sheet') ||
    q.includes('pre-repair list') ||
    q.includes('action items')
  ) {
    return {
      intent: 'GENERATE_DIAGNOSTIC_CHECKLIST',
      confidence: 0.95,
      extractedDtc,
    };
  }

  // 3. Compare Possible Causes
  if (
    q.includes('compare') ||
    q.includes('versus') ||
    q.includes(' vs ') ||
    q.includes('compare causes') ||
    q.includes('most likely cause') ||
    q.includes('differential diagnosis') ||
    q.includes('likelihood')
  ) {
    return {
      intent: 'COMPARE_POSSIBLE_CAUSES',
      confidence: 0.9,
      extractedDtc,
    };
  }

  // 4. Summarize Repair Procedures
  if (
    q.includes('repair procedure') ||
    q.includes('how to replace') ||
    q.includes('replace procedure') ||
    q.includes('replacement steps') ||
    q.includes('install steps') ||
    q.includes('removal and install') ||
    q.includes('repair summary') ||
    q.includes('how do i fix') ||
    q.includes('step to fix')
  ) {
    return {
      intent: 'SUMMARIZE_REPAIR_PROCEDURES',
      confidence: 0.9,
      extractedDtc,
    };
  }

  // 5. Guide Diagnostic Workflow
  if (
    q.includes('diagnostic workflow') ||
    q.includes('guide diagnostic') ||
    q.includes('how to diagnose') ||
    q.includes('troubleshoot workflow') ||
    q.includes('diagnostic tree') ||
    q.includes('pinpoint test') ||
    q.includes('multimeter test') ||
    q.includes('step by step test')
  ) {
    return {
      intent: 'GUIDE_DIAGNOSTIC_WORKFLOW',
      confidence: 0.9,
      extractedDtc,
    };
  }

  // 6. Explain DTC Codes
  if (
    extractedDtc ||
    q.includes('dtc') ||
    q.includes('obd code') ||
    q.includes('trouble code') ||
    q.includes('fault code') ||
    q.includes('check engine code')
  ) {
    return {
      intent: 'EXPLAIN_DTC_CODES',
      confidence: 0.92,
      extractedDtc,
    };
  }

  // 7. Explain Maintenance Schedules
  if (
    q.includes('maintenance') ||
    q.includes('service interval') ||
    q.includes('oil change') ||
    q.includes('fluid capacity') ||
    q.includes('coolant change') ||
    q.includes('transmission fluid') ||
    q.includes('spark plug interval') ||
    q.includes('schedule') ||
    q.includes('service due')
  ) {
    return {
      intent: 'EXPLAIN_MAINTENANCE_SCHEDULES',
      confidence: 0.88,
    };
  }

  // 8. Explain Components
  if (
    q.includes('what is') ||
    q.includes('what does the') ||
    q.includes('how does the') ||
    q.includes('component') ||
    q.includes('sensor') ||
    q.includes('actuator') ||
    q.includes('injector') ||
    q.includes('alternator') ||
    q.includes('solenoid') ||
    q.includes('catalytic converter') ||
    q.includes('caliper') ||
    q.includes('thermostat') ||
    q.includes('spark plug') ||
    q.includes('fuel rail') ||
    q.includes('maf')
  ) {
    return {
      intent: 'EXPLAIN_COMPONENTS',
      confidence: 0.85,
      extractedDtc,
    };
  }

  // 9. Explain Symptoms
  if (
    q.includes('symptom') ||
    q.includes('shake') ||
    q.includes('vibrat') ||
    q.includes('smoke') ||
    q.includes('knocking') ||
    q.includes('rough idle') ||
    q.includes('stalling') ||
    q.includes('hesitat') ||
    q.includes('squeak') ||
    q.includes('loss of power') ||
    q.includes('overheat') ||
    q.includes('wont start') ||
    q.includes("won't start") ||
    q.includes('crank') ||
    q.includes('misfir') ||
    q.includes('leak')
  ) {
    return {
      intent: 'EXPLAIN_SYMPTOMS',
      confidence: 0.85,
    };
  }

  // Default to General Inquiry
  return {
    intent: 'GENERAL_INQUIRY',
    confidence: 0.7,
    extractedDtc,
  };
}
