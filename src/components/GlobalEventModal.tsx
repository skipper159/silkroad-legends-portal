import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { weburl } from '@/lib/api';
import { ExternalLink } from 'lucide-react';

interface SiteModal {
  id: number;
  title: string;
  content: string;
  image_url: string;
  button_text: string;
  button_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  show_once: boolean;
}

const GlobalEventModal = () => {
  const [modal, setModal] = useState<SiteModal | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchActiveModal();
  }, []);

  const fetchActiveModal = async () => {
    try {
      const response = await fetch(`${weburl}/api/modals/active`);
      if (response.ok) {
        const activeModals: SiteModal[] = await response.json();

        // Find the first modal that hasn't been dismissed (if show_once is true)
        const displayableModal = activeModals.find((m) => {
          if (!m.show_once) return true; // Always show if show_once is false

          // Check localStorage for dismissal
          const storageKey = `modal_dismissed_${m.id}`;
          const dismissedAt = localStorage.getItem(storageKey);

          if (!dismissedAt) return true; // Not dismissed yet

          // Optional: Check if dismissal expired (e.g., 24 hours) if you want "once per day" logic
          // For now, we'll assume "once per browser session" or "forever" until cleared.
          // Let's implement "once per day" logic for better UX
          const dismissalDate = new Date(dismissedAt);
          const now = new Date();
          const hoursSinceDismissal = (now.getTime() - dismissalDate.getTime()) / (1000 * 60 * 60);

          return hoursSinceDismissal > 24; // Show again after 24 hours
        });

        if (displayableModal) {
          setModal(displayableModal);
          // Small delay to ensure smooth rendering
          setTimeout(() => setIsOpen(true), 1000);
        }
      }
    } catch (err) {
      console.error('Failed to fetch active modals:', err);
    }
  };

  const handleDismiss = () => {
    if (modal && modal.show_once) {
      localStorage.setItem(`modal_dismissed_${modal.id}`, new Date().toISOString());
    }
    setIsOpen(false);
  };

  if (!modal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent className='bg-theme-surface border-theme-primary sm:max-w-md md:max-w-lg lg:max-w-2xl p-0 overflow-hidden'>
        {/* Image Header */}
        {modal.image_url && (
          <div className='w-full h-48 md:h-64 relative bg-black/50'>
            <img src={`${weburl}${modal.image_url}`} alt={modal.title} className='w-full h-full object-cover' />
            <div className='absolute inset-0 bg-theme-surface' />
          </div>
        )}

        <div className='p-6 relative'>
          <DialogHeader className='mb-4'>
            <DialogTitle className='text-2xl font-cinzel text-theme-primary'>{modal.title}</DialogTitle>
          </DialogHeader>

          <DialogDescription className='text-theme-text-muted whitespace-pre-line'>
            {/* Render HTML content safely or plain text */}
            <div dangerouslySetInnerHTML={{ __html: modal.content }} />
          </DialogDescription>

          <DialogFooter className='mt-6 flex flex-col sm:flex-row gap-3'>
            <Button
              variant='outline'
              onClick={handleDismiss}
              className='border-lafftale-gold/50 text-theme-primary hover:bg-lafftale-gold/10 w-full sm:w-auto'
            >
              Close
            </Button>
            {modal.button_url && modal.button_text && (
              <Button
                className='bg-theme-primary text-theme-primary-foreground hover:bg-theme-accent w-full sm:w-auto'
                onClick={() => {
                  window.open(modal.button_url, '_blank');
                  handleDismiss();
                }}
              >
                {modal.button_text} <ExternalLink className='ml-2 h-4 w-4' />
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalEventModal;
