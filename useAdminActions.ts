import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  AdminActionType,
  AdminActionPayload,
  EntityType,
  BanUserPayload,
  RefundPayload,
  VerifyIdentityPayload,
  ReassignProPayload,
  CancelMissionPayload,
  AvailablePro,
  ResetPasswordPayload,
  CloseTicketPayload,
  AssignTicketPayload
} from '../types/adminActions';

interface UseAdminActionsReturn {
  currentAction: AdminActionPayload | null;
  isModalOpen: boolean;
  isLoading: boolean;
  handleAdminAction: (
    actionType: AdminActionType,
    entityId: string,
    entityType: EntityType,
    entityData?: Record<string, unknown>
  ) => Promise<void>;
  closeModal: () => void;
  executeBanUser: (payload: BanUserPayload) => Promise<void>;
  executeRefund: (payload: RefundPayload) => Promise<void>;
  executeVerifyIdentity: (payload: VerifyIdentityPayload) => Promise<void>;
  executeReassignPro: (payload: ReassignProPayload) => Promise<void>;
  executeCancelMission: (payload: CancelMissionPayload) => Promise<void>;
  executeResetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  executeViewInvoice: (orderId: string) => void;
  executeCloseTicket: (payload: CloseTicketPayload) => Promise<void>;
  executeAssignTicket: (payload: AssignTicketPayload) => Promise<void>;
  getAvailablePros: (orderId: string) => AvailablePro[];
}

const MOCK_AVAILABLE_PROS: AvailablePro[] = [
  {
    id: 'pro-alt-1',
    name: 'דני הצנרת',
    category: 'אינסטלציה',
    rating: 4.7,
    distance: 2.3,
    completedJobs: 156,
    isVerified: true
  },
  {
    id: 'pro-alt-2',
    name: 'אבי השרברב',
    category: 'אינסטלציה',
    rating: 4.9,
    distance: 3.8,
    completedJobs: 312,
    isVerified: true
  },
  {
    id: 'pro-alt-3',
    name: 'משה הצנרה',
    category: 'אינסטלציה',
    rating: 4.5,
    distance: 5.1,
    completedJobs: 89,
    isVerified: true
  },
  {
    id: 'pro-alt-4',
    name: 'יובל אינסטלציה',
    category: 'אינסטלציה',
    rating: 4.6,
    distance: 6.2,
    completedJobs: 203,
    isVerified: false
  }
];

export function useAdminActions(): UseAdminActionsReturn {
  const [currentAction, setCurrentAction] = useState<AdminActionPayload | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = useCallback(() => {
    setCurrentAction(null);
    setIsModalOpen(false);
  }, []);

  const executeBanUser = useCallback(async (payload: BanUserPayload) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Admin Action] Ban User:', payload);
      toast.success('הפעולה בוצעה בהצלחה', {
        description: `המשתמש הושעה ${payload.duration === 'permanent' ? 'לצמיתות' : payload.duration === '7_days' ? 'ל-7 ימים' : 'ל-30 ימים'}`
      });
      closeModal();
    } catch (error) {
      console.error('[Admin Action] Ban User Error:', error);
      toast.error('שגיאה בביצוע הפעולה', {
        description: 'אנא נסה שוב מאוחר יותר'
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const executeRefund = useCallback(async (payload: RefundPayload) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Admin Action] Refund:', payload);
      toast.success('הפעולה בוצעה בהצלחה', {
        description: `החזר של ₪${payload.amount} ${payload.isPartial ? '(חלקי)' : '(מלא)'} בוצע בהצלחה`
      });
      closeModal();
    } catch (error) {
      console.error('[Admin Action] Refund Error:', error);
      toast.error('שגיאה בביצוע הפעולה', {
        description: 'אנא נסה שוב מאוחר יותר'
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const executeVerifyIdentity = useCallback(async (payload: VerifyIdentityPayload) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Admin Action] Verify Identity:', payload);
      toast.success('הפעולה בוצעה בהצלחה', {
        description: payload.approved ? 'הזהות אומתה בהצלחה' : 'הבקשה לאימות זהות נדחתה'
      });
      closeModal();
    } catch (error) {
      console.error('[Admin Action] Verify Identity Error:', error);
      toast.error('שגיאה בביצוע הפעולה', {
        description: 'אנא נסה שוב מאוחר יותר'
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const executeReassignPro = useCallback(async (payload: ReassignProPayload) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Admin Action] Reassign Pro:', payload);
      const newPro = MOCK_AVAILABLE_PROS.find(p => p.id === payload.newProId);
      toast.success('הפעולה בוצעה בהצלחה', {
        description: `ההזמנה הוחלפה ל${newPro?.name || 'בעל מקצוע חדש'}`
      });
      closeModal();
    } catch (error) {
      console.error('[Admin Action] Reassign Pro Error:', error);
      toast.error('שגיאה בביצוע הפעולה', {
        description: 'אנא נסה שוב מאוחר יותר'
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const executeCancelMission = useCallback(async (payload: CancelMissionPayload) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Admin Action] Cancel Mission:', payload);
      toast.success('הפעולה בוצעה בהצלחה', {
        description: `ההזמנה בוטלה${payload.applyFeesToPro ? ' עם חיוב לבעל המקצוע' : ' ללא חיוב'}`
      });
      closeModal();
    } catch (error) {
      console.error('[Admin Action] Cancel Mission Error:', error);
      toast.error('שגיאה בביצוע הפעולה', {
        description: 'אנא נסה שוב מאוחר יותר'
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const getAvailablePros = useCallback((orderId: string): AvailablePro[] => {
    console.log('[Admin Action] Getting available pros for order:', orderId);
    return MOCK_AVAILABLE_PROS;
  }, []);

  const executeResetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Admin Action] Reset Password:', payload);
      toast.success('נשלח אימייל לאיפוס סיסמה', {
        description: `נשלח ל-${payload.email}`
      });
      closeModal();
    } catch (error) {
      console.error('[Admin Action] Reset Password Error:', error);
      toast.error('שגיאה בשליחת האימייל', {
        description: 'אנא נסה שוב מאוחר יותר'
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const executeViewInvoice = useCallback((orderId: string) => {
    console.log('[Admin Action] View Invoice for order:', orderId);
    const invoiceData = {
      orderId,
      generatedAt: new Date().toISOString(),
      items: [
        { description: 'שירות', amount: 150 },
        { description: 'עמלת פלטפורמה', amount: 15 }
      ],
      total: 165
    };
    console.log('[Admin Action] Invoice Data:', invoiceData);
    toast.info('מציג חשבונית...', {
      description: `חשבונית להזמנה ${orderId.substring(0, 8)}`
    });
  }, []);

  const executeCloseTicket = useCallback(async (payload: CloseTicketPayload) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Admin Action] Close Ticket:', payload);
      toast.success('הפנייה נסגרה בהצלחה', {
        description: `פנייה #${payload.ticketId.substring(0, 8)} סומנה כטופלה`
      });
      closeModal();
    } catch (error) {
      console.error('[Admin Action] Close Ticket Error:', error);
      toast.error('שגיאה בסגירת הפנייה', {
        description: 'אנא נסה שוב מאוחר יותר'
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const executeAssignTicket = useCallback(async (payload: AssignTicketPayload) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[Admin Action] Assign Ticket:', payload);
      toast.success('הפנייה הוקצתה בהצלחה', {
        description: `הפנייה הוקצתה ל-${payload.assigneeName}`
      });
      closeModal();
    } catch (error) {
      console.error('[Admin Action] Assign Ticket Error:', error);
      toast.error('שגיאה בהקצאת הפנייה', {
        description: 'אנא נסה שוב מאוחר יותר'
      });
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const handleAdminAction = useCallback(async (
    actionType: AdminActionType,
    entityId: string,
    entityType: EntityType,
    entityData?: Record<string, unknown>
  ): Promise<void> => {
    if (actionType === 'VIEW_INVOICE') {
      executeViewInvoice(entityId);
      return;
    }
    if (actionType === 'CLOSE_TICKET') {
      await executeCloseTicket({ 
        ticketId: entityId, 
        resolution: (entityData?.resolution as string) || 'נסגר על ידי מנהל' 
      });
      return;
    }
    if (actionType === 'ASSIGN_TICKET') {
      await executeAssignTicket({ 
        ticketId: entityId, 
        assigneeId: (entityData?.assigneeId as string) || 'admin-1',
        assigneeName: (entityData?.assigneeName as string) || 'Admin User'
      });
      return;
    }
    
    setCurrentAction({ actionType, entityId, entityType, entityData });
    setIsModalOpen(true);
  }, [executeViewInvoice, executeCloseTicket, executeAssignTicket]);

  return {
    currentAction,
    isModalOpen,
    isLoading,
    handleAdminAction,
    closeModal,
    executeBanUser,
    executeRefund,
    executeVerifyIdentity,
    executeReassignPro,
    executeCancelMission,
    executeResetPassword,
    executeViewInvoice,
    executeCloseTicket,
    executeAssignTicket,
    getAvailablePros
  };
}
