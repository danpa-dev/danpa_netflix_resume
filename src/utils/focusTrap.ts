/**
 * Focus trap utility for modal components
 * Keeps focus within the modal when it's open
 */

export interface FocusTrapOptions {
  container: HTMLElement;
  onEscape?: () => void;
  initialFocus?: HTMLElement;
  returnFocus?: HTMLElement;
}

export class FocusTrap {
  private container: HTMLElement;
  private onEscape?: () => void;
  private returnFocus?: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private firstElement?: HTMLElement;
  private lastElement?: HTMLElement;
  private handleKeyDown: (event: KeyboardEvent) => void;

  constructor(options: FocusTrapOptions) {
    this.container = options.container;
    this.onEscape = options.onEscape;
    this.returnFocus = options.returnFocus;
    this.handleKeyDown = this.createKeyDownHandler();
    
    this.initialize();
  }

  private initialize() {
    // Store the element that had focus before the modal opened
    this.returnFocus = document.activeElement as HTMLElement;
    
    // Get all focusable elements within the container
    this.focusableElements = this.getFocusableElements();
    
    if (this.focusableElements.length > 0) {
      this.firstElement = this.focusableElements[0];
      this.lastElement = this.focusableElements[this.focusableElements.length - 1];
    }
    
    // Add event listener
    this.container.addEventListener('keydown', this.handleKeyDown, true);
    
    // Focus the first element or the container itself
    if (this.firstElement) {
      this.firstElement.focus();
    } else {
      this.container.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    const elements = this.container.querySelectorAll(focusableSelectors.join(', '));
    return Array.from(elements) as HTMLElement[];
  }

  private createKeyDownHandler() {
    return (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.onEscape) {
        event.preventDefault();
        this.onEscape();
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        
        if (this.focusableElements.length === 0) return;
        
        const currentIndex = this.focusableElements.indexOf(document.activeElement as HTMLElement);
        
        if (event.shiftKey) {
          // Shift + Tab: move backwards
          if (currentIndex <= 0) {
            this.lastElement?.focus();
          } else {
            this.focusableElements[currentIndex - 1]?.focus();
          }
        } else {
          // Tab: move forwards
          if (currentIndex >= this.focusableElements.length - 1 || currentIndex === -1) {
            this.firstElement?.focus();
          } else {
            this.focusableElements[currentIndex + 1]?.focus();
          }
        }
      }
    };
  }

  public destroy() {
    this.container.removeEventListener('keydown', this.handleKeyDown, true);
    
    // Return focus to the original element
    if (this.returnFocus && this.returnFocus.focus) {
      this.returnFocus.focus();
    }
  }

  public updateFocusableElements() {
    this.focusableElements = this.getFocusableElements();
    if (this.focusableElements.length > 0) {
      this.firstElement = this.focusableElements[0];
      this.lastElement = this.focusableElements[this.focusableElements.length - 1];
    }
  }
} 