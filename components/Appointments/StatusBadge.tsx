
import React from 'react';
import { Badge } from '@/components/ui/badge';

type StatusType = 'confirmé' | 'annulé' | 'reporté' | 'terminé' | 'en attente';

interface StatusBadgeProps {
  status: StatusType;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'confirmé':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmé</Badge>;
    case 'annulé':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Annulé</Badge>;
    case 'reporté':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Reporté</Badge>;
    case 'terminé':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Terminé</Badge>;
    case 'en attente':
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">En attente</Badge>;
  }
};

export default StatusBadge;
