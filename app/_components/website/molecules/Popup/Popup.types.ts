export interface PopupProps {
  /**
   * Title shown in the popup
   */
  title: string;
  
  /**
   * Description shown in the popup
   */
  description: string;
  
  /**
   * Controls visibility
   */
  isOpen: boolean;
  
  /**
   * Function called when closing the popup
   */
  onClose: () => void;
  
  /**
   * Optional delay in milliseconds for auto-closing.
   * Defaults to 6000 (6 seconds) if not provided. Set to 0 to disable.
   */
  autoCloseDelay?: number;
  
  /**
   * Optional CSS classes
   */
  className?: string;
}
