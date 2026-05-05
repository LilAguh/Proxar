import { useState } from 'react';
import { Modal } from '@presentation/molecules';
import { Button, Input, Select, Textarea } from '@presentation/atoms';
import { ModalClient } from '@presentation/features/ModalClient/ModalClient';
import { useClients } from '@/hooks/api';
import { useCreateDirectBudget } from '@/hooks/api/useBudgets';
import { TicketType, Priority } from '@core/enums';
import { budgetRepository } from '@data/repositories/budget.repository';
import './DirectBudgetModal.scss';

interface BudgetItem {
  quantity: number;
  description: string;
  unitPrice: number;
  ivaPercentage: number;
}

interface DirectBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectBudgetModal = ({ isOpen, onClose }: DirectBudgetModalProps) => {
  const { data: clients } = useClients();
  const createBudget = useCreateDirectBudget();

  // Modal de cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Datos del cliente y ticket
  const [clientId, setClientId] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>(TicketType.Other);
  const [ticketPriority, setTicketPriority] = useState<Priority>(Priority.Medium);

  // Datos del presupuesto
  const [validDays, setValidDays] = useState(15);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([
    { quantity: 1, description: '', unitPrice: 0, ivaPercentage: 21 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { quantity: 1, description: '', unitPrice: 0, ivaPercentage: 21 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof BudgetItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateItemSubtotal = (item: BudgetItem) => {
    return item.quantity * item.unitPrice;
  };

  const subtotalBeforeDiscount = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const subtotalAfterDiscount = subtotalBeforeDiscount - discount;

  // IVA se calcula sobre el subtotal descontado
  const totalIVA = items.reduce((sum, item) => {
    const discountRatio = discount > 0 ? discount / subtotalBeforeDiscount : 0;
    const itemDiscountedSubtotal = calculateItemSubtotal(item) * (1 - discountRatio);
    return sum + (itemDiscountedSubtotal * (item.ivaPercentage / 100));
  }, 0);

  const total = subtotalAfterDiscount + totalIVA;

  const handleSubmit = async () => {
    if (!clientId || !ticketTitle.trim() || items.some(i => !i.description.trim() || i.unitPrice <= 0 || i.quantity <= 0)) {
      return;
    }

    const budgetData = {
      clientId,
      ticketTitle,
      ticketDescription,
      ticketType,
      ticketPriority,
      validDays,
      discount,
      notes,
      terms,
      items: items.map(item => ({
        quantity: item.quantity,
        description: item.description,
        unitPrice: item.unitPrice,
        ivaPercentage: item.ivaPercentage,
      })),
    };

    await createBudget.mutateAsync(budgetData);

    // Descargar PDF automáticamente
    const budget = await budgetRepository.getAll(1, 1);
    if (budget && budget.length > 0) {
      window.open(budgetRepository.getPdfUrl(budget[0].id), '_blank');
    }

    handleClose();
  };

  const handleClientCreated = (newClientId: string) => {
    setClientId(newClientId);
    setIsClientModalOpen(false);
  };

  const handleClose = () => {
    setClientId('');
    setTicketTitle('');
    setTicketDescription('');
    setTicketType(TicketType.Other);
    setTicketPriority(Priority.Medium);
    setValidDays(15);
    setDiscount(0);
    setNotes('');
    setTerms('');
    setItems([{ quantity: 1, description: '', unitPrice: 0, ivaPercentage: 21 }]);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Presupuesto">
      <div className="direct-budget-modal">
        <div className="direct-budget-modal__section">
          <h3 className="direct-budget-modal__section-title">Cliente y Ticket</h3>

          <div className="direct-budget-modal__client-select">
            <Select
              label="Cliente *"
              value={clientId}
              onChange={setClientId}
              options={[
                { value: '', label: 'Seleccionar cliente' },
                ...(clients?.map((c) => ({ value: c.id, label: c.name })) || []),
              ]}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsClientModalOpen(true)}
              className="direct-budget-modal__client-button"
            >
              + Nuevo Cliente
            </Button>
          </div>

          <Input
            label="Título del trabajo *"
            value={ticketTitle}
            onChange={setTicketTitle}
            placeholder="Ej: Reparación de ventana cocina"
          />

          <Textarea
            label="Descripción"
            value={ticketDescription}
            onChange={setTicketDescription}
            placeholder="Detalles del trabajo a realizar..."
            rows={3}
          />

          <div className="direct-budget-modal__row">
            <Select
              label="Tipo de trabajo"
              value={ticketType}
              onChange={(value) => setTicketType(value as TicketType)}
              options={[
                { value: TicketType.Measurement, label: 'Medición' },
                { value: TicketType.Repair, label: 'Reparación' },
                { value: TicketType.Glass, label: 'Vidrio' },
                { value: TicketType.Window, label: 'Abertura' },
                { value: TicketType.Construction, label: 'Obra' },
                { value: TicketType.Other, label: 'Otro' },
              ]}
            />

            <Select
              label="Prioridad"
              value={ticketPriority}
              onChange={(value) => setTicketPriority(value as Priority)}
              options={[
                { value: Priority.Low, label: 'Baja' },
                { value: Priority.Medium, label: 'Media' },
                { value: Priority.High, label: 'Alta' },
                { value: Priority.Urgent, label: 'Urgente' },
              ]}
            />
          </div>
        </div>

        <div className="direct-budget-modal__section">
          <h3 className="direct-budget-modal__section-title">Items del Presupuesto</h3>

          {items.map((item, index) => (
            <div key={index} className="direct-budget-modal__item">
              <div className="direct-budget-modal__item-header">
                <span className="direct-budget-modal__item-number">#{index + 1}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="direct-budget-modal__item-remove"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="direct-budget-modal__item-fields">
                <Input
                  label="Cantidad"
                  type="number"
                  value={item.quantity.toString()}
                  onChange={(value) => handleItemChange(index, 'quantity', Number(value))}
                  min={1}
                />

                <Input
                  label="Descripción *"
                  value={item.description}
                  onChange={(value) => handleItemChange(index, 'description', value)}
                  placeholder="Descripción del ítem"
                />

                <Input
                  label="Precio Unitario *"
                  type="number"
                  value={item.unitPrice.toString()}
                  onChange={(value) => handleItemChange(index, 'unitPrice', Number(value))}
                  min={0}
                  step="0.01"
                />

                <Input
                  label="IVA %"
                  type="number"
                  value={item.ivaPercentage.toString()}
                  onChange={(value) => handleItemChange(index, 'ivaPercentage', Number(value))}
                  min={0}
                  max={100}
                  step="0.01"
                />
              </div>

              <div className="direct-budget-modal__item-total">
                Subtotal: {formatCurrency(calculateItemSubtotal(item))}
              </div>
            </div>
          ))}

          <Button variant="ghost" onClick={handleAddItem} size="sm">
            + Agregar ítem
          </Button>
        </div>

        <div className="direct-budget-modal__section">
          <h3 className="direct-budget-modal__section-title">Totales y Metadata</h3>

          <div className="direct-budget-modal__row">
            <Input
              label="Días de validez"
              type="number"
              value={validDays.toString()}
              onChange={(value) => setValidDays(Number(value))}
              min={1}
            />

            <Input
              label="Descuento"
              type="number"
              value={discount.toString()}
              onChange={(value) => setDiscount(Number(value))}
              min={0}
              step="0.01"
            />
          </div>

          <Textarea
            label="Notas internas"
            value={notes}
            onChange={setNotes}
            placeholder="Notas visibles solo internamente..."
            rows={2}
          />

          <Textarea
            label="Términos y condiciones"
            value={terms}
            onChange={setTerms}
            placeholder="Términos que aparecerán en el PDF..."
            rows={2}
          />

          <div className="direct-budget-modal__totals">
            <div className="direct-budget-modal__total-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotalBeforeDiscount)}</span>
            </div>
            {discount > 0 && (
              <div className="direct-budget-modal__total-row">
                <span>Descuento:</span>
                <span className="direct-budget-modal__discount">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="direct-budget-modal__total-row">
              <span>IVA:</span>
              <span>{formatCurrency(totalIVA)}</span>
            </div>
            <div className="direct-budget-modal__total-row direct-budget-modal__total-row--final">
              <span>TOTAL:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="direct-budget-modal__actions">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!clientId || !ticketTitle.trim() || items.some(i => !i.description.trim())}
            loading={createBudget.isPending}
          >
            Crear Presupuesto
          </Button>
        </div>
      </div>
    </Modal>

    <ModalClient
      isOpen={isClientModalOpen}
      onClose={() => setIsClientModalOpen(false)}
      onClientCreated={handleClientCreated}
    />
    </>
  );
};
