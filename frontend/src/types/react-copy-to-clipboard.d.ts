declare module 'react-copy-to-clipboard' {
  import { ReactNode } from 'react';
  
  interface CopyToClipboardProps {
    text: string;
    onCopy?: () => void;
    children: ReactNode;
  }
  
  export const CopyToClipboard: React.FC<CopyToClipboardProps>;
}