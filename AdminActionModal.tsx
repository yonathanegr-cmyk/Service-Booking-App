import {
  Dialog,
  DialogContent,
} from '../../ui/dialog';
import { AdminActionPayload, AdminActionType } from '../../../types/adminActions';
import { BanUserModal } from './BanUserModal';
import { RefundModal } from './RefundModal';
import { DocumentReviewModal } from './DocumentReviewModal';
import { ReassignProModal } from './ReassignProModal';
import { CancelMissionModal } from './CancelMissionModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { useAdminActions } from '../../../hooks/useAdminActions';

interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAction: AdminActionPayload | null;
  adminActions: ReturnType<typeof useAdminActions>;
}

export function AdminActionModal({
  isOpen,
  onClose,
  currentAction,
  adminActions
}: AdminActionModalProps) {
  if (!currentAction) return null;

  const {
    isLoading,
    executeBanUser,
    executeRefund,
    executeVerifyIdentity,
    executeReassignPro,
    executeCancelMission,
    executeResetPassword,
    getAvailablePros
  } = adminActions;

  const entityData = currentAction.entityData || {};

  const renderModalContent = () => {
    switch (currentAction.actionType) {
      case 'BAN_USER':
        return (
          <BanUserModal
            userId={currentAction.entityId}
            userName={entityData.userName as string | undefined}
            isLoading={isLoading}
            onConfirm={executeBanUser}
            onCancel={onClose}
          />
        );

      case 'FULL_REFUND':
      case 'PARTIAL_REFUND':
        return (
          <RefundModal
            orderId={currentAction.entityId}
            originalAmount={(entityData.totalPrice as number) || 0}
            commissionAmount={(entityData.commissionAmount as number) || 0}
            netToPro={(entityData.netToPro as number) || 0}
            currency={(entityData.currency as string) || 'ILS'}
            isLoading={isLoading}
            onConfirm={executeRefund}
            onCancel={onClose}
          />
        );

      case 'VERIFY_IDENTITY':
        return (
          <DocumentReviewModal
            userId={currentAction.entityId}
            userName={entityData.userName as string | undefined}
            documents={entityData.documents as any}
            isLoading={isLoading}
            onConfirm={executeVerifyIdentity}
            onCancel={onClose}
          />
        );

      case 'REASSIGN_PRO':
        return (
          <ReassignProModal
            orderId={currentAction.entityId}
            currentProName={entityData.currentProName as string | undefined}
            availablePros={getAvailablePros(currentAction.entityId)}
            isLoading={isLoading}
            onConfirm={executeReassignPro}
            onCancel={onClose}
          />
        );

      case 'CANCEL_MISSION':
        return (
          <CancelMissionModal
            orderId={currentAction.entityId}
            proName={entityData.proName as string | undefined}
            orderAmount={entityData.totalPrice as number | undefined}
            isLoading={isLoading}
            onConfirm={executeCancelMission}
            onCancel={onClose}
          />
        );

      case 'RESET_PASSWORD':
        return (
          <ResetPasswordModal
            userId={currentAction.entityId}
            email={entityData.email as string | undefined}
            userName={entityData.userName as string | undefined}
            isLoading={isLoading}
            onConfirm={executeResetPassword}
            onCancel={onClose}
          />
        );

      default:
        return (
          <div className="p-6 text-center text-gray-500" dir="rtl">
            <p>פעולה לא נתמכת: {currentAction.actionType}</p>
          </div>
        );
    }
  };

  const getModalSize = (): string => {
    switch (currentAction.actionType) {
      case 'REASSIGN_PRO':
        return 'sm:max-w-lg';
      case 'FULL_REFUND':
      case 'PARTIAL_REFUND':
        return 'sm:max-w-md';
      case 'VERIFY_IDENTITY':
        return 'sm:max-w-xl';
      default:
        return 'sm:max-w-md';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className={`${getModalSize()} p-6`}>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
}
