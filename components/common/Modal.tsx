
import React from 'react';
import { Card } from './Card';
import { XIcon } from '../icons/XIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-lg mx-4">
        <Card>
          <Card.Header className="flex justify-between items-center">
            <Card.Title>{title}</Card.Title>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <XIcon className="w-6 h-6" />
            </button>
          </Card.Header>
          <Card.Body>{children}</Card.Body>
        </Card>
      </div>
    </div>
  );
};
