import { AiIntent } from './types';
import {
  isArabicText,
  normalizeArabic,
  analyzeMultilingualAutomotiveQuery,
} from '../search/terminologyMap';

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
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();
  const normAr = normalizeArabic(rawQ);
  const dtcMatch = rawQ.match(DTC_REGEX);
  const extractedDtc = dtcMatch ? dtcMatch[1].toUpperCase() : undefined;

  // Multilingual term analysis
  const queryAnalysis = analyzeMultilingualAutomotiveQuery(rawQ);

  // 1. Mechanic Report
  if (
    q.includes('mechanic report') ||
    q.includes('work order') ||
    q.includes('repair order') ||
    q.includes('technician report') ||
    q.includes('workshop report') ||
    q.includes('generate report') ||
    q.includes('ro report') ||
    normAr.includes('تقرير ورشه') ||
    normAr.includes('تقرير ميكانيكي') ||
    normAr.includes('تقرير الفحص') ||
    normAr.includes('تقرير الصيانه') ||
    normAr.includes('امر عمل') ||
    normAr.includes('امر اصلاح') ||
    normAr.includes('تقرير فني') ||
    normAr.includes('فاتوره صيانه')
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
    q.includes('action items') ||
    normAr.includes('قائمه فحص') ||
    normAr.includes('قائمه تدقيق') ||
    normAr.includes('قائمه التحقق') ||
    normAr.includes('تشيك ليست') ||
    normAr.includes('بنود الفحص') ||
    normAr.includes('فحص ما قبل الاصلاح')
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
    q.includes('likelihood') ||
    normAr.includes('مقارنه') ||
    normAr.includes('مقارنه الاسباب') ||
    normAr.includes('الاسباب المحتمله') ||
    normAr.includes('السبب الاكثر ترجيحا') ||
    normAr.includes('اكثر احتمال') ||
    normAr.includes('ترجيح') ||
    normAr.includes('نسبه الاحتمال')
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
    q.includes('step to fix') ||
    normAr.includes('طريقه استبدال') ||
    normAr.includes('خطوات الاصلاح') ||
    normAr.includes('كيفيه تغيير') ||
    normAr.includes('كيف اصلح') ||
    normAr.includes('خطوات الفك والتركيب') ||
    normAr.includes('طريقه تصليح') ||
    normAr.includes('استبدال') ||
    normAr.includes('فك وتركيب') ||
    normAr.includes('ملخص الاصلاح')
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
    q.includes('step by step test') ||
    normAr.includes('خطوات التشخيص') ||
    normAr.includes('مسار التشخيص') ||
    normAr.includes('شجره التشخيص') ||
    normAr.includes('دليل الفحص') ||
    normAr.includes('كيفيه تشخيص') ||
    normAr.includes('فحص بالملتيميتر') ||
    normAr.includes('تسلسل الفحص') ||
    normAr.includes('فحص خطوه بخطوه') ||
    normAr.includes('مخطط تشخيص')
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
    q.includes('check engine code') ||
    normAr.includes('كود') ||
    normAr.includes('رمز العطل') ||
    normAr.includes('كود عطل') ||
    normAr.includes('كود الفحص') ||
    normAr.includes('اكواد obd') ||
    normAr.includes('شرح الكود') ||
    normAr.includes('لمبه المحرك') ||
    normAr.includes('كود dtc')
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
    q.includes('service due') ||
    normAr.includes('صيانه') ||
    normAr.includes('جدول الصيانه') ||
    normAr.includes('تغيير زيت') ||
    normAr.includes('زوجه الزيت') ||
    normAr.includes('ماء الرديتر') ||
    normAr.includes('سائل التبريد') ||
    normAr.includes('زيت القير') ||
    normAr.includes('سائل الفرامل') ||
    normAr.includes('بواجي') ||
    normAr.includes('شمعات الاحتراق') ||
    normAr.includes('مواعيد الصيانه') ||
    normAr.includes('سعه الزيت') ||
    normAr.includes('عيار الزيت')
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
    q.includes('maf') ||
    queryAnalysis.componentEn ||
    normAr.includes('ما هو') ||
    normAr.includes('ما هي وظيفه') ||
    normAr.includes('حساس') ||
    normAr.includes('بخاخ') ||
    normAr.includes('بخاخات') ||
    normAr.includes('دينامو') ||
    normAr.includes('مولد') ||
    normAr.includes('سلف') ||
    normAr.includes('بادئ التشغيل') ||
    normAr.includes('ثرموستات') ||
    normAr.includes('بلف الحراره') ||
    normAr.includes('طرمبه ماء') ||
    normAr.includes('مضخه ماء') ||
    normAr.includes('كويل') ||
    normAr.includes('كويلات') ||
    normAr.includes('حساس الشكمان') ||
    normAr.includes('حساس الاكسجين') ||
    normAr.includes('حساس الهواء') ||
    normAr.includes('دبه التلوث') ||
    normAr.includes('فلتر بيئه') ||
    normAr.includes('مكابح') ||
    normAr.includes('اقمشه') ||
    normAr.includes('قماشات')
  ) {
    return {
      intent: 'EXPLAIN_COMPONENTS',
      confidence: 0.85,
      extractedDtc,
      extractedComponent: queryAnalysis.componentEn,
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
    q.includes('leak') ||
    normAr.includes('عرض') ||
    normAr.includes('اعراض') ||
    normAr.includes('اهتزاز') ||
    normAr.includes('رجه') ||
    normAr.includes('تفتفه') ||
    normAr.includes('تقطيع') ||
    normAr.includes('دخان') ||
    normAr.includes('صوت طقطقه') ||
    normAr.includes('خشونه في المحرك') ||
    normAr.includes('انطفاء المحرك') ||
    normAr.includes('صعوبه تشغيل') ||
    normAr.includes('لا يشتغل') ||
    normAr.includes('تهريب') ||
    normAr.includes('تسريب') ||
    normAr.includes('ارتفاع حراره') ||
    normAr.includes('حراره زائده') ||
    normAr.includes('ضعف عزم') ||
    normAr.includes('فقدان القوه')
  ) {
    return {
      intent: 'EXPLAIN_SYMPTOMS',
      confidence: 0.85,
    };
  }

  // Default to General Automotive Inquiry
  return {
    intent: 'GENERAL_INQUIRY',
    confidence: 0.75,
    extractedDtc,
    extractedComponent: queryAnalysis.componentEn,
  };
}
