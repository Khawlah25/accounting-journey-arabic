// إدارة جلسات المحاكاة المحاسبية

import { SessionData, Company, Stage, StageType, AccountingPeriod } from '@/types/accounting';
import { generateCompany, getChartOfAccounts, generateTransactions, getAvailableCompanies } from './dataGenerator';
import { v4 as uuidv4 } from 'uuid';

const SESSION_STORAGE_KEY = 'accounting_sim';
const SESSION_EXPIRY_DAYS = 7;

// المراحل السبعة للدورة المحاسبية (بعد حذف مرحلة ورقة العمل)
const stages: Stage[] = [
  {
    id: 1,
    type: 'identify-transactions',
    title: 'تحديد العمليات المالية',
    description: 'تحليل وتصنيف العمليات المالية للشركة',
    isCompleted: false,
    isActive: true
  },
  {
    id: 2,
    type: 'journal-entries',
    title: 'تسجيل العمليات المالية',
    description: 'إعداد قيود اليومية للعمليات المالية',
    isCompleted: false,
    isActive: false
  },
  {
    id: 3,
    type: 'journal-analysis',
    title: 'تحليل القيود',
    description: 'تحليل القيود المحاسبية المسجلة',
    isCompleted: false,
    isActive: false
  },
  {
    id: 4,
    type: 'post-to-ledger',
    title: 'ترحيل القيود إلى دفتر الأستاذ',
    description: 'ترحيل جميع القيود من دفتر اليومية إلى دفتر الأستاذ',
    isCompleted: false,
    isActive: false
  },
  {
    id: 5,
    type: 'trial-balance',
    title: 'إعداد ميزان المراجعة',
    description: 'استخراج ميزان المراجعة من دفتر الأستاذ',
    isCompleted: false,
    isActive: false
  },
  {
    id: 7,
    type: 'adjusting-entries-1',
    title: 'قيود التسوية ١',
    description: 'مرحلة إضافية لقيود التسوية',
    isCompleted: false,
    isActive: false
  },
  {
    id: 8,
    type: 'post-adjustment-trial-balance',
    title: 'ميزان المراجعة بعد التسويات',
    description: 'إعداد ميزان المراجعة المعدل بعد قيود التسوية',
    isCompleted: false,
    isActive: false
  },
  {
    id: 9,
    type: 'financial-statements',
    title: 'إعداد القوائم المالية',
    description: 'استخراج قائمة الدخل والميزانية العمومية',
    isCompleted: false,
    isActive: false
  }
];

export function createNewSession(companyId: string = 'al-taqaddum'): SessionData {
  try {
    console.log('🆕 createNewSession: بدء إنشاء جلسة جديدة');
    
    const sessionId = uuidv4();
    console.log('🆔 تم إنشاء معرف الجلسة:', sessionId);
    
    const company = generateCompany(companyId);
    console.log('🏢 تم إنشاء بيانات الشركة:', company.name);
    
    const chartOfAccounts = getChartOfAccounts();
    console.log('📊 تم تحميل دليل الحسابات:', chartOfAccounts.length, 'حساب');
    
    const transactions = generateTransactions(company);
    console.log('💰 تم إنشاء العمليات المالية:', transactions.length, 'عملية');
    
    const sessionData: SessionData = {
      sessionId,
      companyId,
      company,
      chartOfAccounts,
      transactions,
      currentStage: 1,
      progress: {},
      userAnswers: {},
      ledgerData: {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      currentPeriod: 'q1'
    };
    
    console.log('💾 حفظ الجلسة...');
    saveSession(sessionData);
    console.log('✅ تم إنشاء الجلسة بنجاح');
    
    return sessionData;
  } catch (error) {
    console.error('❌ خطأ في createNewSession:', error);
    throw new Error('فشل في إنشاء جلسة جديدة: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
  }
}

export function loadSession(): SessionData | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    const sessionData = parsed as SessionData;
    
    // فحص انتهاء صلاحية الجلسة
    const createdAt = new Date(sessionData.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > SESSION_EXPIRY_DAYS) {
      clearSession();
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('خطأ في تحميل الجلسة:', error);
    clearSession();
    return null;
  }
}

export function saveSession(sessionData: SessionData): void {
  try {
    sessionData.lastUpdated = new Date().toISOString();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('خطأ في حفظ الجلسة:', error);
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getCurrentOrCreateSession(companyId: string = 'al-taqaddum'): SessionData {
  try {
    console.log('🔄 getCurrentOrCreateSession: بدء العملية');
    
    const existingSession = loadSession();
    console.log('📄 existingSession:', existingSession ? 'موجودة' : 'غير موجودة');
    
    // إذا كانت الجلسة موجودة لكن لا تحتوي على companyId أو شركة مختلفة، أنشئ جلسة جديدة
    if (existingSession && (!existingSession.companyId || existingSession.companyId !== companyId)) {
      console.log(`⚠️ الجلسة لشركة مختلفة، إنشاء جلسة جديدة للشركة: ${companyId}`);
      clearSession();
      return createNewSession(companyId);
    }
    
    // إذا كانت الجلسة موجودة لكن لا تحتوي على العدد المطلوب من العمليات، أنشئ جلسة جديدة
    const expectedTransactionCount = companyId === 'al-fajr' ? 40 : 65;
    if (existingSession && existingSession.transactions.length < expectedTransactionCount) {
      console.log(`⚠️ الجلسة تحتوي على ${existingSession.transactions.length} عملية، المطلوب ${expectedTransactionCount}، إنشاء جلسة جديدة`);
      clearSession();
      return createNewSession(companyId);
    }
    
    if (existingSession) {
      console.log('✅ استخدام الجلسة الموجودة');
      return existingSession;
    }
    
    console.log('🆕 إنشاء جلسة جديدة');
    return createNewSession(companyId);
  } catch (error) {
    console.error('❌ خطأ في getCurrentOrCreateSession:', error);
    // في حالة الخطأ، أنشئ جلسة جديدة
    try {
      clearSession();
      return createNewSession(companyId);
    } catch (newSessionError) {
      console.error('❌ خطأ في إنشاء جلسة جديدة:', newSessionError);
      throw new Error('فشل في إنشاء جلسة المحاكاة');
    }
  }
}

export function updateSessionProgress(
  sessionData: SessionData, 
  stageId: number, 
  isCompleted: boolean
): SessionData {
  const updatedSession = {
    ...sessionData,
    progress: {
      ...sessionData.progress,
      [stageId]: isCompleted
    },
    currentStage: isCompleted ? Math.min(stageId + 1, 9) : sessionData.currentStage
  };
  
  saveSession(updatedSession);
  return updatedSession;
}

export function updateUserAnswers(
  sessionData: SessionData, 
  questionId: string, 
  answer: any
): SessionData {
  const updatedSession = {
    ...sessionData,
    userAnswers: {
      ...sessionData.userAnswers,
      [questionId]: answer
    }
  };
  
  saveSession(updatedSession);
  return updatedSession;
}

export function getStages(): Stage[] {
  return [...stages];
}

export function getStageById(id: number): Stage | null {
  return stages.find(stage => stage.id === id) || null;
}

export function getActiveStages(currentStage: number): Stage[] {
  return stages.map(stage => ({
    ...stage,
    isActive: stage.id === currentStage,
    isCompleted: stage.id < currentStage
  }));
}

export function isStageUnlocked(stageId: number, progress: { [key: number]: boolean }): boolean {
  if (stageId === 1) return true;
  return progress[stageId - 1] === true;
}

export function getCompletionPercentage(progress: { [key: number]: boolean }): number {
  const completedStages = Object.values(progress).filter(Boolean).length;
  return Math.round((completedStages / stages.length) * 100);
}

export function resetSessionToStage(sessionData: SessionData, stageId: number): SessionData {
  const updatedProgress = { ...sessionData.progress };
  
  // إزالة التقدم من المراحل التي تأتي بعد المرحلة المحددة
  for (let i = stageId; i <= 9; i++) {
    delete updatedProgress[i];
  }
  
  const updatedSession = {
    ...sessionData,
    currentStage: stageId,
    progress: updatedProgress
  };
  
  saveSession(updatedSession);
  return updatedSession;
}

// الحصول على قائمة الشركات المتاحة
export function getAvailableCompaniesFromSession(): Company[] {
  return getAvailableCompanies();
}